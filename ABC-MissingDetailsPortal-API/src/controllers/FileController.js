/**
 * Controller for files endpoints
 */
const service = require('../services/FileService')

/**
 * Create a file
 * @param req the request
 * @param res the response
 */
function * create (req, res) {
  res.json(yield service.create(req.file, req.user.id))
}

/**
 * Delete a file
 * @param req the request
 * @param res the response
 */
function * remove (req, res) {
  yield service.remove(req.params.id, req.user.id)
  res.status(204).end()
}

module.exports = {
  create,
  remove
}
