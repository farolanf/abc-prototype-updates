/**
 * Controller for notifications endpoints
 */
const service = require('../services/NotificationService')

/**
 * Search notifications of the current user
 * @param req the request
 * @param res the response
 */
function * search (req, res) {
  res.send(yield service.search(req.query, req.user.id))
}

/**
 * Get a notification of the current user by id
 * @param req the request
 * @param res the response
 */
function * get (req, res) {
  res.send(yield service.get(req.params.id, req.user.id))
}

/**
 * Mark a notification of the current user as read
 * @param req the request
 * @param res the response
 */
function * markAsRead (req, res) {
  yield service.markAsRead(req.params.id, req.user.id)
  res.status(204).end()
}

/**
 * Mark all notification of the current user as read
 * @param req the request
 * @param res the response
 */
function * markAllAsRead (req, res) {
  yield service.markAllAsRead(req.user.id)
  res.status(204).end()
}

module.exports = {
  search,
  get,
  markAsRead,
  markAllAsRead
}
