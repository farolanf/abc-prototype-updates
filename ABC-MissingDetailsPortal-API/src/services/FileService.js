/**
 * This service provides operations to manage files
 */
const Joi = require('joi')
const config = require('config')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const models = require('../models')
const fs = require('fs-extra')
const path = require('path')

/**
 * Create a file
 * @param {Object} file the file data
 * @param {Integer} userId the current user id
 */
function * create (file, userId) {
  yield helper.sanitizeXls(file)
  return yield models.File.create({
    name: file.originalname,
    mimeType: file.mimetype,
    fileURL: `${config.API_SCHEME_HOST}:${config.PORT}/upload/${file.filename}`,
    filename: file.filename,
    createdBy: userId
  })
}

create.schema = {
  file: Joi.object().required(),
  userId: Joi.id()
}

/**
 * Remove file by id
 * @param {Integer} id the file id
 * @param {Integer} userId the user id, if user id is not provided then user permission check is ignored
 */
function * remove (id, userId) {
  const file = yield helper.ensureExist(models.File, id)
  if (userId && Number(file.createdBy) !== userId) {
    throw new errors.ForbiddenError('You can not remove other user\'s file')
  }
  const filename = file.filename
  yield file.destroy()
  // delete file in local storage
  if (filename) {
    yield fs.remove(path.join(__dirname, '../../public/upload', filename))
  }
}

remove.schema = {
  id: Joi.id(),
  userId: Joi.id().optional()
}

module.exports = {
  create,
  remove
}

logger.buildService(module.exports)
