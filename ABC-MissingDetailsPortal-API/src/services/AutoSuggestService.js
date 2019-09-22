/**
 * This service provides operations to do auto suggestions
 */
const Joi = require('joi')
const logger = require('../common/logger')
const models = require('../models')
const _ = require('lodash')
const Sequelize = require('sequelize')

const Op = Sequelize.Op

const querySchema = Joi.object().keys({
  keyword: Joi.string().required(),
  count: Joi.number().integer().min(1).default(10)
})

/**
 * Auto suggest exception types
 * @param {Object} query the query parameters
 */
function * suggestExceptionTypes (query) {
  return yield models.ExceptionType.findAll({
    where: { name: {[Op.like]: `${query.keyword}%`} },
    limit: query.count
  })
}

suggestExceptionTypes.schema = {
  query: querySchema
}

/**
 * Auto suggest countries
 * @param {Object} query the query parameters
 */
function * suggestCountries (query) {
  return yield models.Country.findAll({
    where: { name: {[Op.like]: `${query.keyword}%`} },
    limit: query.count
  })
}

suggestCountries.schema = {
  query: querySchema
}

/**
 * Auto suggest currencies
 * @param {Object} query the query parameters
 */
function * suggestCurrencies (query) {
  return yield models.Currency.findAll({
    where: { name: {[Op.like]: `${query.keyword}%`} },
    limit: query.count
  })
}

suggestCurrencies.schema = {
  query: querySchema
}

/**
 * Auto suggest account names
 * @param {Object} query the query parameters
 */
function * suggestAccountNames (query) {
  const sql = 'SELECT DISTINCT TOP ? accountName FROM Queries q WHERE q.accountName LIKE ?'
  const res = yield models.sequelize.query(sql, {replacements: [query.count, `${query.keyword}%`],
    type: Sequelize.QueryTypes.SELECT})
  if (res) {
    return _.map(res, (item) => item.accountName)
  } else {
    return []
  }
}

suggestAccountNames.schema = {
  query: querySchema
}

/**
 * Auto suggest AMP ids
 * @param {Object} query the query parameters
 */
function * suggestAMPIds (query) {
  const sql = 'SELECT DISTINCT TOP ? ampId FROM Queries q WHERE q.ampId LIKE ?'
  const res = yield models.sequelize.query(sql, {replacements: [query.count, `${query.keyword}%`],
    type: Sequelize.QueryTypes.SELECT})
  if (res) {
    return _.map(res, (item) => item.ampId)
  } else {
    return []
  }
}

suggestAMPIds.schema = {
  query: querySchema
}

/**
 * Auto suggest sap contracts
 * @param {Object} query the query parameters
 */
function * suggestSapContracts (query) {
  const sql = 'SELECT DISTINCT TOP ? sapContract FROM Queries q WHERE q.sapContract LIKE ?'
  const res = yield models.sequelize.query(sql, {replacements: [query.count, `${query.keyword}%`],
    type: Sequelize.QueryTypes.SELECT})
  if (res) {
    return _.map(res, (item) => item.sapContract)
  } else {
    return []
  }
}

suggestSapContracts.schema = {
  query: querySchema
}

module.exports = {
  suggestExceptionTypes,
  suggestCountries,
  suggestCurrencies,
  suggestAccountNames,
  suggestAMPIds,
  suggestSapContracts
}

logger.buildService(module.exports)
