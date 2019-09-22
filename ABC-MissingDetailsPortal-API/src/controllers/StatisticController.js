/**
 * Controller for statistics endpoints
 */
const service = require('../services/StatisticService')

/**
 * Get global statistics
 * @param req the request
 * @param res the response
 */
function * getGlobalStatistics (req, res) {
  res.send(yield service.getGlobalStatistics(req.user))
}

module.exports = {
  getGlobalStatistics
}
