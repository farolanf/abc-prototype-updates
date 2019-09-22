/**
 * This service provides operations to manage queries and related entities
 */
const Joi = require('joi')
const config = require('config')
const _ = require('lodash')
const co = require('co')
const Sequelize = require('sequelize')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const models = require('../models')
const constants = require('../../app-constants')
const csvParse = require('csv-parse/lib/sync')
const path = require('path')
const fs = require('fs-extra')
const fileType = require('file-type')
const uuid = require('uuid/v4')
const ms = require('ms')
const AdmZip = require('adm-zip')
const readChunk = require('read-chunk')
const pug = require('pug')

const Op = Sequelize.Op

/**
 * Parse comma separated ids string
 * @param {String} s the string
 * @returns {Array} the parsed ids
 */
function parseIds (s) {
  if (!s) {
    return []
  }
  return _.map(s.split(','), (str) => {
    const id = Number(str)
    if (_.isNaN(id)) {
      throw new errors.BadRequestError(`Invalid id string: ${str}`)
    }
    return id
  })
}

/**
 * Decrypt query
 * @param {Object} query the query to decrypt
 * @returns {Object} the decrypted query
 */
function decryptQuery (query) {
  const q = helper.decryptObj('Query', query)
  if (q.sdmComments) {
    q.sdmComments = _.map(q.sdmComments, comment => helper.decryptObj('SDMComment', comment))
  }
  return q
}

/**
 * Set extra fields for query, at present only a calculated field 'aging' is set
 * @param {Object} query the query
 * @returns {Object} the query
 */
function setExtraFields (query) {
  const q = query.toJSON ? query.toJSON() : query
  if (q.openedDate && q.status == 'Open') {
    const mills = new Date().getTime() - new Date(q.openedDate).getTime()
    q.aging = ms(mills)
  } else if (q.openedDate && (q.status == 'Closed' || q.status == 'Rejected')) {
    const mills = new Date(q.closedDate).getTime() - new Date(q.openedDate).getTime()
    q.aging = ms(mills)
  }
  return q
}

/**
 * Search queries
 * @param {Object} criteria the search criteria
 * @param {Object} user the current user
 * @returns {Object} the search result
 */
function * search (criteria, user) {
  if (criteria.queryIds) {
    criteria.queryIds = parseIds(criteria.queryIds)
  }
  if (criteria.exceptionTypeIds) {
    criteria.exceptionTypeIds = parseIds(criteria.exceptionTypeIds)
  }
  if (criteria.statuses) {
    criteria.statuses = criteria.statuses.split(',')
    _.each(criteria.statuses, (status) => {
      if (status.trim().length === 0) {
        throw new errors.BadRequestError('Status can not be empty.')
      }
    })
  }
  const include = [{model: models.ExceptionType, as: 'exceptionType'},
    {model: models.Country, as: 'country'},
    {model: models.Currency, as: 'currency'},
    {model: models.File, as: 'attachments'},
    {model: models.SDMComment,
      as: 'sdmComments',
      include: [{model: models.File, as: 'attachments'}, {model: models.User, as: 'sdm'}]}
  ]

  const sdmInclude = {model: models.User, as: 'sdm'}
  if (criteria.sdm) {
    const sdmWhere = {[Op.like]: `%${criteria.sdm}%`}
    sdmInclude.where = {
      [Op.or]: [
        {firstName: sdmWhere},
        {lastName: sdmWhere},
        {email: sdmWhere}
      ]
    }
  }
  include.push(sdmInclude)

  const requestorInclude = {model: models.User, as: 'requestor'}
  if (criteria.requestor) {
    const requestorWhere = {[Op.like]: `%${criteria.requestor}%`}
    requestorInclude.where = {
      [Op.or]: [
        {firstName: requestorWhere},
        {lastName: requestorWhere},
        {email: requestorWhere}
      ]
    }
  }
  include.push(requestorInclude)

  const watchersInclude = {model: models.User, as: 'watchers'}
  if (criteria.watchList) {
    watchersInclude.where = {
      id: user.id
    }
  }
  include.push(watchersInclude)

  const filter = {}

  const whereConditions = []

  if (user.role === constants.Roles.DeliveryUser) {
    whereConditions.push({
      [Op.or]: [
        {sdmId: user.id},
        {status: {[Op.in]: [constants.QueryStatuses.New, constants.QueryStatuses.Open]}}
      ]
    })
  }

  if (criteria.myOnly) {
    if (user.role === constants.Roles.DeliveryUser) {
      whereConditions.push({
        sdmId: user.id
      })
    } else if (user.role === constants.Roles.ContractAdminUser) {
      whereConditions.push({
        requestorId: user.id
      })
    }
  }
  if (criteria.queryIds) {
    whereConditions.push({
      id: {[Op.in]: criteria.queryIds}
    })
  }
  if (criteria.queryId) {
    whereConditions.push({
      id: {[Op.like]: `%${criteria.queryId}%`}
    })
  }
  if (criteria.exceptionTypeIds) {
    whereConditions.push({
      exceptionTypeId: {[Op.in]: criteria.exceptionTypeIds}
    })
  }
  if (criteria.accountName) {
    whereConditions.push({
      accountName: {[Op.like]: `%${criteria.accountName}%`}
    })
  }
  if (criteria.ampId) {
    whereConditions.push({
      ampId: {[Op.like]: `%${criteria.ampId}%`}
    })
  }
  if (criteria.sapContract) {
    whereConditions.push({
      sapContract: {[Op.like]: `%${criteria.sapContract}%`}
    })
  }
  if (criteria.currencyId) {
    whereConditions.push({
      currencyId: criteria.currencyId
    })
  }
  if (criteria.countryId) {
    whereConditions.push({
      countryId: criteria.countryId
    })
  }
  if (criteria.statuses) {
    whereConditions.push({
      status: {[Op.in]: criteria.statuses}
    })
  }
  if (criteria.dueDateStart) {
    whereConditions.push({dueDate: {[Op.gte]: criteria.dueDateStart}})
  }
  if (criteria.dueDateEnd) {
    whereConditions.push({dueDate: {[Op.lte]: criteria.dueDateEnd}})
  }
  if (criteria.comment) {
    whereConditions.push({
      comment: {[Op.like]: `%${criteria.comment}%`}
    })
  }
  if (criteria.priority) {
    whereConditions.push({
      priority: criteria.priority
    })
  }
  if (criteria.viewType === 'Expanded') {
    filter.include = include
  }
  filter.where = {[Op.and]: whereConditions}

  // Sorting
  if (criteria.sortBy === 'exceptionTypeId') {
    filter.order = [['exceptionType', 'name', criteria.sortOrder]]
    filter.subQuery = false
  } else if (criteria.sortBy === 'countryId') {
    filter.order = [[{model: models.Country, as: 'country'}, 'name', criteria.sortOrder]]
    filter.subQuery = false
  } else if (criteria.sortBy === 'currencyId') {
    filter.order = [[{model: models.Currency, as: 'currency'}, 'name', criteria.sortOrder]]
    filter.subQuery = false
  } else if (criteria.sortBy === 'sdmId') {
    filter.order = [
      [{model: models.User, as: 'sdm'}, 'firstName', criteria.sortOrder],
      [{model: models.User, as: 'sdm'}, 'lastName', criteria.sortOrder]
    ]
    filter.subQuery = false
  } else if (criteria.sortBy === 'requestorId') {
    filter.order = [
      [{model: models.User, as: 'requestor'}, 'firstName', criteria.sortOrder],
      [{model: models.User, as: 'requestor'}, 'lastName', criteria.sortOrder]
    ]
    filter.subQuery = false
  } else {
    filter.order = [[criteria.sortBy, criteria.sortOrder]]
  }
  if (filter.order[0][0] !== 'id') {
    filter.order.push(['id', 'asc'])
  }

  // Paging
  filter.limit = criteria.perPage
  filter.offset = (criteria.page - 1) * criteria.perPage

  if (filter.include) {
    filter.distinct = true
  }

  const searchResult = yield helper.findAndCountAll(models.Query, filter)
  searchResult.page = criteria.page
  searchResult.perPage = criteria.perPage
  searchResult.results = _.map(searchResult.results, res => decryptQuery(res))
  searchResult.results = _.map(searchResult.results, res => setExtraFields(res))
  return searchResult
}

search.schema = {
  criteria: Joi.object().keys({
    queryIds: Joi.string(),
    queryId: Joi.string(),
    exceptionTypeIds: Joi.string(),
    accountName: Joi.string(),
    ampId: Joi.string(),
    sapContract: Joi.string(),
    countryId: Joi.id().optional(),
    currencyId: Joi.id().optional(),
    sdm: Joi.string(),
    requestor: Joi.string(),
    statuses: Joi.string(),
    dueDateStart: Joi.date(),
    dueDateEnd: Joi.date().when('dueDateStart', {
      is: Joi.date().required(),
      then: Joi.date().min(Joi.ref('dueDateStart'))
    }),
    comment: Joi.string(),
    priority: Joi.string(),
    viewType: Joi.string().valid('Expanded', 'Collapsed').default('Expanded'),
    watchList: Joi.boolean().default(false),
    page: Joi.page(),
    perPage: Joi.perPage(),
    sortBy: Joi.string().valid('id', 'exceptionTypeId', 'countryId', 'accountName', 'ampId', 'billingIndex',
      'billingStartDate', 'billingEndDate', 'sapContract', 'valueToBeBilled', 'currencyId', 'sdmId', 'requestorId',
      'dueDate', 'reviseDate', 'openedDate', 'closedDate', 'rework', 'reworkReason', 'dmpsPmps', 'status', 'exceptionSubType',
      'comment', 'updatedOn').default('id'),
    sortOrder: Joi.sortOrder(),
    myOnly: Joi.boolean().default(false)
  }),
  user: Joi.object()
}

/**
 * Create a new query
 * @param {Object} query the query
 * @returns {Object} the created query
 */
function * create (query) {
  query = helper.encryptObj('Query', query)
  yield helper.ensureExist(models.ExceptionType, query.exceptionTypeId)
  yield helper.ensureExist(models.Country, query.countryId)
  yield helper.ensureExist(models.Currency, query.currencyId)
  yield helper.validateIds(models.File, query.attachmentIds)
  const sdm = yield helper.ensureExist(models.User, query.sdmId)
  validateSdm(sdm)
  if (query.watcherIds) {
    yield helper.validateIds(models.User, query.watcherIds)
  }
  query.openedDate = new Date()
  query.priority = constants.Priorities.Low

  let theId
  yield models.sequelize.transaction(transaction => co(function * () {
    const q = yield models.Query.create(_.omit(query, ['attachmentIds']), {transaction})
    if (query.attachmentIds) {
      yield q.setAttachments(query.attachmentIds, {transaction})
    }
    if (query.watcherIds) {
      yield q.setWatchers(query.watcherIds, {transaction})
    }
    theId = q.id
  }))

  yield models.Notification.create({
    title: 'Query created',
    text: `Query #${theId} is assigned to SDM ${sdm.email}.`,
    relatedModel: 'Query',
    relatedModelId: null,
    notificationType: constants.NotificationTypes.NewQueries,
    status: constants.NotificationStatuses.New,
    userId: sdm.id
  })

  // Return with all populated fields
  return yield get(theId)
}

create.schema = {
  query: Joi.object().keys({
    exceptionTypeId: Joi.id(),
    exceptionSubType: Joi.string(),
    countryId: Joi.id(),
    accountName: Joi.string().required(),
    ampId: Joi.string().required(),
    billingIndex: Joi.string().required(),
    billingStartDate: Joi.date().required(),
    billingEndDate: Joi.date().required(),
    sapContract: Joi.string().required(),
    valueToBeBilled: Joi.number().min(0).required(),
    currencyId: Joi.id(),
    sdmId: Joi.id().optional(),
    requestorId: Joi.id(),
    dueDate: Joi.date().required(),
    reviseDate: Joi.date(),
    closedDate: Joi.date(),
    rework: Joi.boolean().required(),
    reworkReason: Joi.string().allow(''),
    dmpsPmps: Joi.string().required(),
    status: Joi.string().valid(_.values(constants.QueryStatuses)).default(constants.QueryStatuses.New),
    comment: Joi.string().allow(''),
    attachmentIds: Joi.array().items(Joi.id().optional()),
    watcherIds: Joi.array().items(Joi.id().optional())
  })
}

/**
 * Get query by id
 * @param {Integer} id the id
 * @returns {Object} the query
 */
function * get (id) {
  const query = yield helper.ensureExist(models.Query, {
    where: {id},
    include: [
      {model: models.ExceptionType, as: 'exceptionType'},
      {model: models.Country, as: 'country'},
      {model: models.Currency, as: 'currency'},
      {model: models.User, as: 'sdm'},
      {model: models.User, as: 'requestor'},
      {model: models.User, as: 'watchers'},
      {model: models.SDMComment, as: 'sdmComments', include: [{model: models.File, as: 'attachments'}]},
      {model: models.File, as: 'attachments'}
    ]
  })
  if (query.status === constants.QueryStatuses.New) {
    query.status = constants.QueryStatuses.Open
    yield query.save()
  }
  return setExtraFields(decryptQuery(query))
}

get.schema = {
  id: Joi.id()
}

/**
 * Update query
 * @param {Integer} id the id
 * @param {Object} query the query
 * @returns {Object} the updated query
 */
function * update (id, query) {
  return yield updatePartially(id, query)
}

update.schema = {
  id: Joi.id(),
  query: create.schema.query
}

/**
 * Update query partially, only passed attributes will be updated
 * @param {Integer} id the id
 * @param {Object} query the query
 * @returns {Object} the updated query
 */
function * updatePartially (id, query) {
  query = helper.encryptObj('Query', query)
  if (query.exceptionTypeId) {
    yield helper.ensureExist(models.ExceptionType, query.exceptionTypeId)
  }
  if (query.countryId) {
    yield helper.ensureExist(models.Country, query.countryId)
  }
  if (query.currencyId) {
    yield helper.ensureExist(models.Currency, query.currencyId)
  }
  if (query.sdmId) {
    const sdm = yield helper.ensureExist(models.User, query.sdmId)
    validateSdm(sdm)
  }
  if (query.requestorId) {
    const ca = yield helper.ensureExist(models.User, query.requestorId)
    validateCA(ca)
  }
  yield helper.validateIds(models.File, query.attachmentIds)

  yield models.sequelize.transaction(transaction => co(function * () {
    const existing = yield helper.ensureExist(models.Query, id)
    const data = _.omit(query, ['attachmentIds'])
    _.assignIn(existing, data)
    yield existing.save({transaction})
    if (query.attachmentIds) {
      yield existing.setAttachments(query.attachmentIds, {transaction})
    }
  }))

  return yield get(id)
}

updatePartially.schema = {
  id: Joi.id(),
  query: Joi.object().keys({
    exceptionTypeId: Joi.id().optional(),
    exceptionSubType: Joi.string(),
    countryId: Joi.id().optional(),
    accountName: Joi.string(),
    ampId: Joi.string(),
    billingIndex: Joi.string(),
    billingStartDate: Joi.date(),
    billingEndDate: Joi.date(),
    sapContract: Joi.string(),
    valueToBeBilled: Joi.number().min(0),
    currencyId: Joi.id().optional(),
    sdmId: Joi.id().optional(),
    requestorId: Joi.id().optional(),
    dueDate: Joi.date(),
    reviseDate: Joi.date(),
    openedDate: Joi.date(),
    closedDate: Joi.date(),
    rework: Joi.boolean(),
    reworkReason: Joi.string(),
    dmpsPmps: Joi.string(),
    status: Joi.string().valid(_.values(constants.QueryStatuses)),
    comment: Joi.string(),
    attachmentIds: Joi.array().items(Joi.id())
  })
}

/**
 * Reassign queries
 * @param {Object} data the reassign data
 */
function * reassign (data) {
  yield helper.validateIds(models.Query, data.queryIds)
  const sdm = yield helper.ensureExist(models.User, data.userId)
  validateSdm(sdm)
  yield models.Query.update({sdmId: data.userId}, {where: {id: {[Op.in]: data.queryIds}}})
  // create notifications
  let text
  if (data.queryIds.length > 1) {
    text = `Queries ${data.queryIds.map(id => `#${id}`).join(', ')} are re-assigned to SDM ${sdm.email}.`
  } else {
    text = `Query #${data.queryIds[0]} is re-assigned to SDM ${sdm.email}.`
  }
  yield models.Notification.create({
    title: 'Query reassigned',
    text,
    relatedModel: 'Query',
    relatedModelId: null,
    notificationType: constants.NotificationTypes.PendingQueries,
    status: constants.NotificationStatuses.New,
    userId: data.userId
  })
}

reassign.schema = {
  data: Joi.object().keys({
    queryIds: Joi.array().items(Joi.id()).required(),
    userId: Joi.id()
  }).required()
}

/**
 * Process attachments, they will be downloaded to local storage.
 * @param attachments the ';' separated attachments
 * @param user the current user
 * @param folder the folder of extracted files
 * @param fullFolder the full folder path of extracted files
 * @returns the attachment ids
 */
function * processAttachments (attachments, user, folder, fullFolder) {
  if (!attachments || attachments.trim().length === 0) {
    return []
  }
  const s = attachments.split(';')
  const ids = []
  for (let i = 0; i < s.length; i += 1) {
    const filename = s[i].trim()
    if (filename.length > 0) {
      const filePath = path.join(fullFolder, filename)
      if (!fs.existsSync(filePath)) {
        throw new errors.ValidationError(`The attachment file ${filename} doesn't exist.`)
      }
      // check MIME type
      const fileHeader = readChunk.sync(filePath, 0, 10000)
      const theFileType = fileType(fileHeader)
      const mimeType = theFileType ? theFileType.mime : null
      // save file object to db
      const fileURL = `${config.API_SCHEME_HOST}:${config.PORT}/upload/${folder}/${filename}`
      yield helper.sanitizeXls({mimetype: mimeType, path: `public/upload/${folder}/${filename}`})
      const file = yield models.File.create({
        name: filename,
        mimeType,
        fileURL,
        filename: `${folder}/${filename}`,
        createdBy: user.id
      })
      ids.push(file.id)
    }
  }
  return ids
}

/**
 * Import query
 * @param record the record to import
 * @param user the current user
 * @param folder the folder of extracted files
 * @param fullFolder the full folder path of extracted files
 */
function * importQuery (record, user, folder, fullFolder) {
  const attachmentIds = yield processAttachments(record[record.length - 1], user, folder, fullFolder)
  const exceptionTypeId = (yield helper.ensureExist(models.ExceptionType, {where: {name: record[0]}})).id

  // calculate due date
  let dueDate
  if (record[12].trim().length > 0) {
    dueDate = new Date(record[12])
  } else {
    const sla = yield models.QueryTypeSLA.findOne({where: {exceptionTypeId}})
    let mills
    if (sla) {
      let unit
      if (sla.units === constants.TimeUnits.Minutes) {
        unit = 1000 * 60
      } else if (sla.units === constants.TimeUnits.Hours) {
        unit = 1000 * 60 * 60
      } else if (sla.units === constants.TimeUnits.Days) {
        unit = 1000 * 60 * 60 * 24
      } else {
        throw new errors.ValidationError(`Invalid query type SLA time units: ${sla.units}`)
      }
      mills = unit * sla.number
    } else {
      mills = ms(config.DEFAULT_DUE_DATE_PERIOD)
    }
    dueDate = new Date(new Date().getTime() + mills)
  }

  const sdm = yield helper.ensureExist(models.User, {where: {email: record[11]}})
  validateSdm(sdm)

  let data = {
    exceptionTypeId,
    exceptionSubType: record[1],
    countryId: (yield helper.ensureExist(models.Country, {where: {name: record[2]}})).id,
    accountName: record[3],
    ampId: record[4],
    billingIndex: record[5],
    billingStartDate: new Date(record[6]),
    billingEndDate: new Date(record[7]),
    sapContract: record[8],
    valueToBeBilled: Number(record[9]),
    currencyId: (yield helper.ensureExist(models.Currency, {where: {name: record[10]}})).id,
    sdmId: sdm.id,
    requestorId: user.id,
    dueDate,
    reviseDate: record[13].trim().length > 0 ? new Date(record[13]) : null,
    openedDate: record[14].trim().length > 0 ? new Date(record[14]) : null,
    closedDate: record[15].trim().length > 0 ? new Date(record[15]) : null,
    rework: Boolean(record[16]),
    reworkReason: record[17],
    dmpsPmps: record[18],
    status: record[19].trim().length > 0 ? record[19] : constants.QueryStatuses.New,
    comment: record[20],
    priority: record[21]
  }
  data = helper.encryptObj('Query', data)

  return yield models.sequelize.transaction(transaction => co(function * () {
    const q = yield models.Query.create(data, {transaction})
    if (attachmentIds && attachmentIds.length > 0) {
      yield q.setAttachments(attachmentIds, {transaction})
    }
    return q
  }))
}

/**
 * Import queries. The input file should be a ZIP file, whilch contains one CSV file and multiple attachments.
 * @param file the data file
 * @param user the current user
 */
function * importQueries (file, user) {
  // extract ZIP files
  const folder = uuid()
  const fullFolder = path.join(__dirname, '../../public/upload', folder)
  const zip = new AdmZip(file.path)
  zip.extractAllTo(fullFolder, true)
  yield fs.remove(file.path)

  // find CSV file
  const fileNames = yield fs.readdir(fullFolder)
  const csvFile = _.find(fileNames, (fn) => fn.toLowerCase().endsWith('.csv') && !fn.toLowerCase().startsWith('attachment'))
  if (!csvFile) {
    throw new errors.ValidationError('There is no CSV file in the ZIP file.')
  }
  const csvFilePath = path.join(fullFolder, csvFile)

  // parse CSV
  const fileContent = yield fs.readFile(csvFilePath, 'UTF8')
  yield fs.remove(csvFilePath)
  const records = csvParse(fileContent, { skip_empty_lines: true })
  if (records.length < 2) {
    throw new errors.ValidationError('The CSV file has no data.')
  }
  // validate headers
  const headers = ['exceptionType', 'exceptionSubType', 'countryName', 'accountName', 'ampId', 'billingIndex',
    'billingStartDate', 'billingEndDate', 'sapContract', 'valueToBeBilled', 'currencyName', 'sdmEmail', 'dueDate',
    'reviseDate', 'openedDate', 'closedDate', 'rework', 'reworkReason', 'dmpsPmps', 'status', 'comment', 'priority',
    'attachments']
  if (headers.length !== records[0].length) {
    throw new errors.ValidationError('The CSV column count is wrong.')
  }
  for (let i = 0; i < headers.length; i += 1) {
    if (headers[i] !== records[0][i]) {
      throw new errors.ValidationError('The CSV headers are invalid.')
    }
  }
  // parse each query
  const failures = []
  const imported = []
  for (let loop = 1; loop < records.length; loop += 1) {
    const record = records[loop]
    try {
      imported.push(yield importQuery(record, user, folder, fullFolder))
    } catch (err) {
      logger.error(`Failed to import record: ${JSON.stringify(record)}`)
      logger.logFullError(err)
      failures.push({ record, error: (err && err.message) || 'unknown error' })
    }
  }
  // create notification
  yield models.Notification.create({
    title: failures.length > 0 ? 'Failed to import queries' : 'Successful query import',
    text: `The queries file ${file.originalname} is imported ${failures.length > 0
      ? 'with errors' : 'successfully'}.`,
    relatedModel: 'Query',
    relatedModelId: null,
    notificationType: constants.NotificationTypes.NewQueries,
    status: constants.NotificationStatuses.New,
    userId: user.id
  })
  if (failures.length > 0) {
    // send failure email
    const html = pug.render(config.IMPORT_FAILURE_EMAIL_BODY, {
      user,
      failures
    })
    yield helper.sendEmail(config.IMPORT_FAILURE_EMAIL_SUBJECT, html, [user.email])
    throw new errors.ValidationError('Failed to import queries.')
  }
  return yield helper.findAndCountAll(models.Query, {
    where: {
      id: {
        [Op.in]: imported.map(q => q.id)
      }
    },
    distinct: true,
    include: [{model: models.ExceptionType, as: 'exceptionType'},
      {model: models.Country, as: 'country'},
      {model: models.Currency, as: 'currency'},
      {model: models.File, as: 'attachments'},
      {model: models.User, as: 'watchers'},
      {model: models.User, as: 'sdm'},
      {model: models.User, as: 'requestor'},
      {model: models.SDMComment,
        as: 'sdmComments',
        include: [{model: models.File, as: 'attachments'}, {model: models.User, as: 'sdm'}]}
    ]
  })
}

importQueries.schema = {
  file: Joi.object().required(),
  user: Joi.object().required()
}

/**
 * Watch a query
 * @param {Integer} id the id
 * @param {Integer} userId the current user id
 */
function * watch (id, userId) {
  const query = yield helper.ensureExist(models.Query, id)
  const watchers = yield query.getWatchers()
  if (!_.find(watchers, (w) => Number(w.id) === userId)) {
    yield query.addWatcher(userId)
  }
}

watch.schema = {
  id: Joi.id(),
  userId: Joi.id()
}

/**
 * Unwatch a query
 * @param {Integer} id the id
 * @param {Integer} userId the current user id
 */
function * unwatch (id, userId) {
  const query = yield helper.ensureExist(models.Query, id)
  const watchers = yield query.getWatchers()
  const index = _.findIndex(watchers, (w) => Number(w.id) === userId)
  if (index >= 0) {
    watchers.splice(index, 1)
    yield query.setWatchers(watchers)
  }
}

unwatch.schema = {
  id: Joi.id(),
  userId: Joi.id()
}

/**
 * Get watchers of query
 * @param {Integer} id the id
 * @returns {Array} the watchers of query
 */
function * getWatchers (id) {
  const query = yield helper.ensureExist(models.Query, id)
  return yield query.getWatchers()
}

getWatchers.schema = {
  id: Joi.id()
}

/**
 * Update watchers of query
 * @param {Integer} id the id
 * @param {Object} body the request body
 */
function * updateWatchers (id, body) {
  yield helper.validateIds(models.User, body.userIds)
  const query = yield helper.ensureExist(models.Query, id)
  yield query.setWatchers(body.userIds)
}

updateWatchers.schema = {
  id: Joi.id(),
  body: Joi.object().keys({
    userIds: Joi.array().items(Joi.id()).required()
  }).required()
}

/**
 * Get SDM comment of query
 * @param {Integer} id the id
 * @returns {Object} the SDM comment of the query
 */
function * getSDMCommentOfQuery (id) {
  const query = yield helper.ensureExist(models.Query, {
    where: {id},
    include: [
      {model: models.SDMComment, as: 'sdmComments', include: [{model: models.File, as: 'attachments'}]}
    ]
  })
  const comments = query.sdmComments
  if (!comments || comments.length === 0) {
    throw new errors.NotFoundError(`No SDM comment for query of id: ${id}`)
  }
  // return the latest comment
  let comment = comments[0]
  for (let i = 1; i < comments.length; i += 1) {
    if (comments[i].createdOn > comment.createdOn) {
      comment = comments[i]
    }
  }
  return helper.decryptObj('SDMComment', comment)
}

getSDMCommentOfQuery.schema = {
  id: Joi.id()
}

/**
 * Create SDM comment for one or multiple queries
 * @param {Object} body the request body
 * @param {Integer} userId the current user id
 */
function * createSDMComment (body, userId) {
  body = helper.encryptObj('SDMComment', body)
  const queryIds = body.queryIds
  const attachmentIds = body.attachmentIds
  yield helper.validateIds(models.Query, queryIds)
  yield helper.validateIds(models.File, attachmentIds)
  delete body.queryIds
  delete body.attachmentIds
  const queries = (yield helper.findAndCountAll(models.Query, {where: {id: {[Op.in]: queryIds}}})).results
  _.each(queries, query => {
    if (_.toNumber(query.sdmId) !== userId) {
      throw new errors.BadRequestError(`Query ${query.id} is not assigned to you`)
    }
  })
  body.sdmId = userId
  let commentId
  yield models.sequelize.transaction(transaction => co(function * () {
    const comment = yield models.SDMComment.create(body, {transaction})
    commentId = comment.id
    if (attachmentIds && attachmentIds.length > 0) {
      yield comment.setAttachments(attachmentIds, {transaction})
    }
    yield comment.setQueries(queryIds, {transaction})
    yield models.Query.update({status: body.status, closedDate: new Date()}, {where: {id: {[Op.in]: queryIds}}, transaction})
  }))
  // create notification
  if (body.status === constants.QueryStatuses.Closed || body.status === constants.QueryStatuses.Rejected) {
    for (let i = 0; i < queryIds.length; ++i) {
      const text = `Query #${queryIds[i]} is ${body.status === constants.QueryStatuses.Closed ? 'closed' : 'rejected'}.`
      const query = yield models.Query.findOne({where: {id: queryIds[i]}})
      yield models.Notification.create({
        title: body.status === constants.QueryStatuses.Closed ? 'Query closed' : 'Query rejected',
        text,
        relatedModel: 'Query',
        relatedModelId: null,
        notificationType: body.status === constants.QueryStatuses.Closed
          ? constants.NotificationTypes.ClosedQueries : constants.NotificationTypes.RejectedQueries,
        status: constants.NotificationStatuses.New,
        userId: query.requestorId
      })
    }
  }

  return yield getSDMComment(commentId)
}

createSDMComment.schema = {
  body: Joi.object().keys({
    text: Joi.string().required(),
    rejectReason: Joi.string(),
    status: Joi.string().valid(_.values(constants.QueryStatuses)).required(),
    attachmentIds: Joi.array().items(Joi.id().optional()),
    queryIds: Joi.array().items(Joi.id()).required()
  }).required(),
  userId: Joi.id()
}

/**
 * Get SDM comment by id
 * @param {Integer} id the id
 * @returns {Object} the SDM comment of the id
 */
function * getSDMComment (id) {
  const comment = yield helper.ensureExist(models.SDMComment, {
    where: {id},
    include: [
      {model: models.User, as: 'sdm'},
      {model: models.File, as: 'attachments'},
      {model: models.Query, as: 'queries'}
    ]
  })
  return helper.decryptObj('SDMComment', comment)
}

getSDMComment.schema = {
  id: Joi.id()
}

/**
 * Make sure sdm is of delivery role
 */
function validateSdm (sdm) {
  if (sdm.role !== constants.Roles.DeliveryUser) {
    throw new errors.BadRequestError('Query can only be assigned to Delivery User')
  }
}

/**
 * Make sure user is of contract admin role
 */
function validateCA (ca) {
  if (ca.role !== constants.Roles.ContractAdminUser) {
    throw new errors.BadRequestError('Query can only be requested by Contract Admin User')
  }
}

module.exports = {
  search,
  create,
  get,
  update,
  updatePartially,
  reassign,
  importQueries,
  watch,
  unwatch,
  getWatchers,
  updateWatchers,
  getSDMCommentOfQuery,
  createSDMComment,
  getSDMComment
}

logger.buildService(module.exports)
