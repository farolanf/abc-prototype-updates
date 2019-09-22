/**
 * This service provides operations to manage jobs
 */
const helper = require('../common/helper')
const logger = require('../common/logger')
const models = require('../models')
const schedule = require('node-schedule')
const config = require('config')
const constants = require('../../app-constants')
const co = require('co')
const _ = require('lodash')
const QueryService = require('./QueryService')
const FileService = require('./FileService')
const ms = require('ms')
const Sequelize = require('sequelize')
const pug = require('pug')

const perPage = Number(config.DEFAULT_PER_PAGE)

let contractUserEmailJob = null
let deliveryAndManagementUserEmailJob = null
const contractUserEmailData = { statuses: [] }
const deliveryAndManagementUserEmailData = { statuses: [], exceptionTypeIds: [] }

/**
 * Send emails
 * @param mapping the mapping data, key is email, value is queries for the email
 */
function * sendEmails (mapping) {
  const emails = _.keys(mapping)
  for (let i = 0; i < emails.length; i += 1) {
    const email = emails[i]
    const queries = mapping[email].queries
    const rows = _.mapValues(_.groupBy(queries, 'exceptionType.name'),
      (items, type) => _.assign({type}, _.mapValues(_.groupBy(items, 'status'), 'length')))
    const html = pug.render(config.QUERY_DATA_EMAIL_BODY, {
      user: mapping[email].user,
      appBase: config.APP_BASE_URL,
      rows
    })
    yield helper.sendEmail(config.QUERY_DATA_EMAIL_SUBJECT, html, [email])
  }
}

/**
 * Run the contract user email job
 */
function * contractUserEmailJobRun () {
  // key is requestor email, value is an array of queries
  const mapping = {}
  let page = 1
  let totalPages = 1
  while (page <= totalPages) {
    const res = yield QueryService.search({ statuses: contractUserEmailData.statuses.join(','), page, perPage }, {})
    page += 1
    totalPages = Math.ceil(res.total / perPage)
    // add query for requestor, i.e. contract admin user
    _.each(res.results, (query) => {
      if (query.requestor) {
        const email = query.requestor.email
        if (mapping[email]) {
          mapping[email].queries.push(query)
        } else {
          mapping[email] = {
            queries: [query],
            user: query.requestor
          }
        }
      }
    })
  }
  // send emails to requestors
  yield sendEmails(mapping)
}

/**
 * Run the delivery and management user email job
 */
function * deliveryAndManagementUserEmailJobRun () {
  // key is SDM email, value is an array of queries
  const mapping = {}
  let page = 1
  let totalPages = 1
  while (page <= totalPages) {
    const res = yield QueryService.search({
      statuses: deliveryAndManagementUserEmailData.statuses.join(','),
      exceptionTypeIds: deliveryAndManagementUserEmailData.exceptionTypeIds.join(','),
      page,
      perPage
    }, {})
    page += 1
    totalPages = Math.ceil(res.total / perPage)
    // add query for SDM
    _.each(res.results, (query) => {
      if (query.sdm) {
        const email = query.sdm.email
        if (mapping[email]) {
          mapping[email].queries.push(query)
        } else {
          mapping[email] = {
            queries: [query],
            user: query.sdm
          }
        }
      }
    })
  }
  // send emails to SDM
  yield sendEmails(mapping)
}

/**
 * Schedule email jobs
 */
function * scheduleEmailJobs () {
  logger.info('Schedule email jobs.')
  // stop previous jobs if any
  if (contractUserEmailJob) {
    contractUserEmailJob.cancel()
    contractUserEmailJob = null
  }
  if (deliveryAndManagementUserEmailJob) {
    deliveryAndManagementUserEmailJob.cancel()
    deliveryAndManagementUserEmailJob = null
  }
  // get settings data
  const contractUserEmailSettings = yield models.ContractUserEmailSettings.findOne({})
  const deliveryAndManagementUserEmailSettings = yield models.DeliveryAndManagementUserEmailSettings.findOne({
    include: [{model: models.ExceptionType, as: 'exceptionTypes'}]
  })
  // schedule jobs
  if (contractUserEmailSettings) {
    const spec = config.FREQUENCIES[contractUserEmailSettings.emailsFrequency]
    contractUserEmailData.statuses = []
    if (contractUserEmailSettings.newQueries) {
      contractUserEmailData.statuses.push(constants.QueryStatuses.New)
    }
    if (contractUserEmailSettings.openQueries) {
      contractUserEmailData.statuses.push(constants.QueryStatuses.Open)
    }
    if (contractUserEmailSettings.closedQueries) {
      contractUserEmailData.statuses.push(constants.QueryStatuses.Closed)
    }
    if (contractUserEmailSettings.rejectedQueries) {
      contractUserEmailData.statuses.push(constants.QueryStatuses.Rejected)
    }
    if (spec && contractUserEmailData.statuses.length > 0) {
      contractUserEmailJob = schedule.scheduleJob(spec, () => {
        co(function * () {
          logger.info('Start to run contract user email job.')
          yield contractUserEmailJobRun()
        }).then(() => {
          logger.info('Contract user email job is run successfully.')
        }).catch((e) => {
          logger.error('There is error for contract user email job.')
          logger.logFullError(e)
        })
      })
    }
  }
  if (deliveryAndManagementUserEmailSettings) {
    const spec = config.FREQUENCIES[deliveryAndManagementUserEmailSettings.emailsFrequency]
    deliveryAndManagementUserEmailData.statuses = []
    if (deliveryAndManagementUserEmailSettings.newQueries) {
      deliveryAndManagementUserEmailData.statuses.push(constants.QueryStatuses.New)
    }
    if (deliveryAndManagementUserEmailSettings.openQueries) {
      deliveryAndManagementUserEmailData.statuses.push(constants.QueryStatuses.Open)
    }
    if (deliveryAndManagementUserEmailSettings.closedQueries) {
      deliveryAndManagementUserEmailData.statuses.push(constants.QueryStatuses.Closed)
    }
    deliveryAndManagementUserEmailData.exceptionTypeIds = _.map(
      deliveryAndManagementUserEmailSettings.exceptionTypes || [], (et) => et.id)
    if (spec && deliveryAndManagementUserEmailData.statuses.length > 0 &&
      deliveryAndManagementUserEmailData.exceptionTypeIds.length > 0) {
      deliveryAndManagementUserEmailJob = schedule.scheduleJob(spec, () => {
        co(function * () {
          logger.info('Start to run delivery and management user email job.')
          yield deliveryAndManagementUserEmailJobRun()
        }).then(() => {
          logger.info('Delivery and management user email job is run successfully.')
        }).catch((e) => {
          logger.error('There is error for delivery and management user email job.')
          logger.logFullError(e)
        })
      })
    }
  }
}

/**
 * Clean files
 */
function * cleanFiles () {
  const retainPeriodMS = ms(config.FILE_RETAINING_PERIOD)
  const dt = new Date(new Date().getTime() - retainPeriodMS)
  const sql = `
    SELECT id FROM Files f WHERE
    NOT EXISTS (SELECT * FROM Users u WHERE u.profilePictureId = f.id) AND
    NOT EXISTS (SELECT * FROM QueryFile q WHERE q.fileId = f.id) AND
    NOT EXISTS (SELECT * FROM SDMCommentFile s WHERE s.fileId = f.id)
    AND f.createdOn < ?
  `
  const res = yield models.sequelize.query(sql, {replacements: [dt], type: Sequelize.QueryTypes.SELECT})
  if (res) {
    for (let i = 0; i < res.length; i += 1) {
      const fileId = Number(res[i].id)
      logger.info(`Remove unused file of id: ${fileId}`)
      yield FileService.remove(fileId)
    }
  }
}

/**
 * Schedule file cleaner jobs
 */
function * scheduleFileCleanerJobs () {
  logger.info('Schedule file cleaner jobs.')
  schedule.scheduleJob(config.UNUSED_FILES_CLEANER_JOB_SCHEDULE, () => {
    co(function * () {
      logger.info('Start to run file cleaner job.')
      yield cleanFiles()
    }).then(() => {
      logger.info('File cleaner job is run successfully.')
    }).catch((e) => {
      logger.error('There is error for file cleaner job.')
      logger.logFullError(e)
    })
  })
}

module.exports = {
  scheduleEmailJobs,
  scheduleFileCleanerJobs
}

logger.buildService(module.exports)
