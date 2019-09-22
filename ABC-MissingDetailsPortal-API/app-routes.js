/**
 * Configure all routes for express app
 */
const _ = require('lodash')
const config = require('config')
const helper = require('./src/common/helper')
const auth = require('./src/common/auth-middleware')
const routes = require('./src/routes')
const multer = require('multer')

const upload = multer({ dest: './public/upload' })

/**
 * Configure all routes for express app
 * @param app the express app
 */
module.exports = (app) => {
  // Load all routes
  _.each(routes, (verbs, path) => {
    _.each(verbs, (def, verb) => {
      const controllerPath = `./src/controllers/${def.controller}`
      const method = require(controllerPath)[def.method]; // eslint-disable-line
      if (!method) {
        throw new Error(`${def.method} is undefined`)
      }

      const actions = []
      actions.push((req, res, next) => {
        req.signature = `${def.controller}#${def.method}`
        next()
      })

      // Authentication and authorization
      if (def.auth) {
        actions.push(auth(def.auth))
      }

      if (def.file) {
        actions.push(upload.single(def.file))
      }

      actions.push(method)
      app[verb](`${config.API_PREFIX}${path}`, helper.autoWrapExpress(actions))
    })
  })
}
