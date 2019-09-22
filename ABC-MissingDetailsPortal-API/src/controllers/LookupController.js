/**
 * Controller for lookup endpoints
 */
const service = require('../services/LookupService')

/**
 * Get countries
 * @param req the request
 * @param res the response
 */
function * getCountries (req, res) {
  res.send(yield service.getCountries())
}

/**
 * Get currencies
 * @param req the request
 * @param res the response
 */
function * getCurrencies (req, res) {
  res.send(yield service.getCurrencies())
}

/**
 * Get exception types
 * @param req the request
 * @param res the response
 */
function * getExceptionTypes (req, res) {
  res.send(yield service.getExceptionTypes())
}

module.exports = {
  getCountries,
  getCurrencies,
  getExceptionTypes
}
