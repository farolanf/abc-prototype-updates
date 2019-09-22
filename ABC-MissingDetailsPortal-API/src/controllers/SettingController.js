/**
 * Controller for setting endpoints
 */
const service = require('../services/SettingService')

/**
 * Get SLA settings
 * @param req the request
 * @param res the response
 */
function * getSLASettings (req, res) {
  res.json(yield service.getSLASettings())
}

/**
 * Save SLA settings
 * @param req the request
 * @param res the response
 */
function * saveSLASettings (req, res) {
  yield service.saveSLASettings(req.body)
  res.status(204).end()
}

/**
 * Get email settings
 * @param req the request
 * @param res the response
 */
function * getEmailSettings (req, res) {
  res.json(yield service.getEmailSettings())
}

/**
 * Save email settings
 * @param req the request
 * @param res the response
 */
function * saveEmailSettings (req, res) {
  yield service.saveEmailSettings(req.body)
  res.status(204).end()
}

module.exports = {
  getSLASettings,
  saveSLASettings,
  getEmailSettings,
  saveEmailSettings
}
