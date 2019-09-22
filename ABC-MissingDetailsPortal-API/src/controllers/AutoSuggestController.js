/**
 * Controller for auto suggest endpoints
 */
const service = require('../services/AutoSuggestService')

/**
 * Auto suggest exception types
 * @param req the request
 * @param res the response
 */
function * suggestExceptionTypes (req, res) {
  res.send(yield service.suggestExceptionTypes(req.query))
}

/**
 * Auto suggest countries
 * @param req the request
 * @param res the response
 */
function * suggestCountries (req, res) {
  res.send(yield service.suggestCountries(req.query))
}

/**
 * Auto suggest currencies
 * @param req the request
 * @param res the response
 */
function * suggestCurrencies (req, res) {
  res.send(yield service.suggestCurrencies(req.query))
}

/**
 * Auto suggest account names
 * @param req the request
 * @param res the response
 */
function * suggestAccountNames (req, res) {
  res.send(yield service.suggestAccountNames(req.query))
}

/**
 * Auto suggest AMP ids
 * @param req the request
 * @param res the response
 */
function * suggestAMPIds (req, res) {
  res.send(yield service.suggestAMPIds(req.query))
}

/**
 * Auto suggest SAP contracts
 * @param req the request
 * @param res the response
 */
function * suggestSapContracts (req, res) {
  res.send(yield service.suggestSapContracts(req.query))
}

module.exports = {
  suggestExceptionTypes,
  suggestCountries,
  suggestCurrencies,
  suggestAccountNames,
  suggestAMPIds,
  suggestSapContracts
}
