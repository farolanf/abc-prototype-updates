/**
 * Controller for users endpoints
 */
const service = require('../services/UserService')

/**
 * Search users
 * @param req the request
 * @param res the response
 */
function * search (req, res) {
  res.send(yield service.search(req.query))
}

/**
 * Create user
 * @param req the request
 * @param res the response
 */
function * create (req, res) {
  res.send(yield service.create(req.body))
}

/**
 * Get a user by id
 * @param req the request
 * @param res the response
 */
function * get (req, res) {
  res.send(yield service.get(req.params.id))
}

/**
 * Update user
 * @param req the request
 * @param res the response
 */
function * update (req, res) {
  res.send(yield service.update(req.params.id, req.body))
}

/**
 * Update user partially
 * @param req the request
 * @param res the response
 */
function * updatePartially (req, res) {
  res.send(yield service.updatePartially(req.params.id, req.body))
}

/**
 * Remove user
 * @param req the request
 * @param res the response
 */
function * remove (req, res) {
  yield service.remove(req.params.id)
  res.status(204).end()
}

/**
 * Get the current user
 * @param req the request
 * @param res the response
 */
function * getMe (req, res) {
  res.send(yield service.get(req.user.id))
}

module.exports = {
  search,
  create,
  get,
  update,
  updatePartially,
  remove,
  getMe
}
