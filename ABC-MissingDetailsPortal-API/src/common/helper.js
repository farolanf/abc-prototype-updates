/**
 * This file defines helper methods
 */
const _ = require('lodash')
const co = require('co')
const errors = require('./errors')
const config = require('config')
const logger = require('./logger')
const nodemailer = require('nodemailer')
const excel = require('exceljs')
const path = require('path')
const bluebird = require('bluebird')

const encryptor = require('simple-encryptor')(config.ENCRYPTION_KEY)
const encryptorDBUrl = require('simple-encryptor')(config.DB_URL_ENCRYPTION_KEY)

const transporter = nodemailer.createTransport(_.extend(config.EMAIL, { logger }))

excel.config.setValue('promise', bluebird)

/**
 * Wrap generator function to standard express function
 * @param {Function} fn the generator function
 * @returns {Function} the wrapped function
 */
function wrapExpress (fn) {
  return function wrapGenerator (req, res, next) {
    co(fn(req, res, next)).catch(next)
  }
}

/**
 * Wrap all generators from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (obj.constructor.name === 'GeneratorFunction') {
    return wrapExpress(obj)
  }
  return obj
}

/**
 * Find an entity matching the given criteria.
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @return {Object} the entity
 * @private
 */
function findOne (Model, criteria) {
  let query
  if (_.isObject(criteria)) {
    query = Model.findOne(criteria)
  } else {
    query = Model.findById(criteria)
  }
  return query
}

/**
 * Ensure entity exists for given criteria. Return error if no result
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @param {Boolean} throwBadRequest true to throw bad request error if not exists, false to throw not found error
 */
function * ensureExist (Model, criteria, throwBadRequest) {
  const result = yield findOne(Model, criteria)
  if (!result) {
    const msg = `${Model.name} not found`
    if (throwBadRequest) {
      throw new errors.BadRequestError(msg)
    } else {
      throw new errors.NotFoundError(msg)
    }
  }
  return result
}

/**
 * Find and update entity
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @param {Object} values the values to update
 * @param {String} errorMessage the error message
 * @returns {Object} the updated entity
 */
function * findOneAndUpdate (Model, criteria, values, errorMessage) {
  const entity = yield ensureExist(Model, criteria, errorMessage)
  return yield entity.update(values)
}

/**
 * Find and remove entity
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @param {String} errorMessage the error message
 * @returns {Object} the entity
 */
function * findOneAndRemove (Model, criteria, errorMessage) {
  const entity = yield ensureExist(Model, criteria, errorMessage)
  return yield entity.destroy()
}

/**
 * Find and count all
 * @param {Object} Model the model to query
 * @param {Object} criteria the criteria
 * @returns {Object} the total record
 */
function * findAndCountAll (Model, criteria) {
  const result = yield Model.findAndCountAll(criteria)
  return {
    total: result.count,
    results: _.map(result.rows, row => row.toJSON())
  }
}

/**
 * send email
 * @param {String} subject the subject
 * @param {String} html the email body in html format
 * @param {Array} recipients the to emails
 * @param {String} fromEmail the from email, if not provided, then configured from email is used
 */
function * sendEmail (subject, html, recipients, fromEmail) {
  const req = {
    from: fromEmail || config.FROM_EMAIL,
    to: recipients.join(','),
    subject,
    html
  }
  yield new Promise((resolve, reject) => {
    transporter.sendMail(req, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Encrypt string
 * @param {String} s the string to encrypt
 * @returns {String} the encrypted string
 */
function encrypt (s) {
  return encryptor.encrypt(s)
}

/**
 * Decrypt string
 * @param {String} s the string to decrypt
 * @returns {String} the decrypted string
 */
function decrypt (s) {
  return encryptor.decrypt(s)
}

/**
 * Encrypt DB URL
 * @param {String} s the string to encrypt
 * @returns {String} the encrypted string
 */
function encryptDBUrl (s) {
  return encryptorDBUrl.encrypt(s)
}

/**
 * Decrypt DB URL
 * @param {String} s the string to decrypt
 * @returns {String} the decrypted string
 */
function decryptDBUrl (s) {
  return encryptorDBUrl.decrypt(s)
}

/**
 * Encrypt object
 * @param {String} objType the object type, 'Query', 'User' or 'SDMComment'
 * @param {Object} obj the object
 * @returns {Object} the encrypted object
 */
function encryptObj (objType, obj) {
  if (!obj) {
    return obj
  }
  let fields
  if (objType === 'Query') {
    fields = config.ENCRYPTED_QUERY_FIELDS
  } else if (objType === 'User') {
    fields = config.ENCRYPTED_USER_FIELDS
  } else if (objType === 'SDMComment') {
    fields = config.ENCRYPTED_SDMCOMMENT_FIELDS
  } else {
    throw new errors.ValidationError(`Invalid object type: ${objType}`)
  }
  _.each(fields, (field) => {
    const value = obj[field]
    if (value) {
      obj[field] = encrypt(value)
    }
  })
  return obj
}

/**
 * Decrypt object
 * @param {String} objType the object type, 'Query', 'User' or 'SDMComment'
 * @param {Object} obj the object
 * @returns {Object} the decrypted object
 */
function decryptObj (objType, obj) {
  if (!obj) {
    return obj
  }
  let fields
  if (objType === 'Query') {
    fields = config.ENCRYPTED_QUERY_FIELDS
  } else if (objType === 'User') {
    fields = config.ENCRYPTED_USER_FIELDS
  } else if (objType === 'SDMComment') {
    fields = config.ENCRYPTED_SDMCOMMENT_FIELDS
  } else {
    throw new errors.ValidationError(`Invalid object type: ${objType}`)
  }
  _.each(fields, (field) => {
    const value = obj[field]
    if (value) {
      obj[field] = decrypt(value)
    }
  })
  return obj
}

/**
 * Ensure entities exist for given ids.
 * @param {Object} Model the model to query
 * @param {Array} ids the ids
 * @returns {Array} entities of the ids
 */
function * validateIds (Model, ids) {
  if (ids) {
    const entities = []
    for (let i = 0; i < ids.length; i += 1) {
      entities.push(yield ensureExist(Model, ids[i]))
    }
    return entities
  } else {
    return []
  }
}

function * sanitizeXls (file) {
  if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
    file.mimetype !== 'application/vnd.ms-excel') { return }

  const filePath = path.join(__dirname, '../../', file.path)
  const workbook = new excel.Workbook()
  yield workbook.xlsx.readFile(filePath)
  workbook.eachSheet(sheet => {
    sheet.eachRow(row => {
      row.eachCell(cell => {
        if (cell.type === excel.ValueType.Formula) {
          cell.value = '\'' + cell.value.formula
        }
      })
    })
  })
  return yield workbook.xlsx.writeFile(filePath)
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  ensureExist,
  findOneAndUpdate,
  findOneAndRemove,
  findAndCountAll,
  sendEmail,
  encrypt,
  decrypt,
  encryptDBUrl,
  decryptDBUrl,
  encryptObj,
  decryptObj,
  validateIds,
  sanitizeXls
}
