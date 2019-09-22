/**
 * This service provides operations to lookup data
 */
const logger = require('../common/logger')
const models = require('../models')

/**
 * Get all countries
 * @returns {Array} the countries
 */
function * getCountries () {
  return yield models.Country.findAll()
}

/**
 * Get all currencies
 * @returns {Array} the currencies
 */
function * getCurrencies () {
  return yield models.Currency.findAll()
}

/**
 * Get all exception types
 * @returns {Array} the exception types
 */
function * getExceptionTypes () {
  return yield models.ExceptionType.findAll()
}

module.exports = {
  getCountries,
  getCurrencies,
  getExceptionTypes
}

logger.buildService(module.exports)
