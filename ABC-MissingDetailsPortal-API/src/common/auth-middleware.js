/**
 * Authentication and authorization middleware
 */
const _ = require('lodash')
const helper = require('./helper')
const config = require('config')

const errors = require('./errors')
const {User} = require('../models')

/**
 * Check if the request is authenticated and authorized.
 * @param {Array} allowedRoles the array of allowed roles
 */
function auth (allowedRoles) {
  return function authMiddleware (req, res, next) {
    // get the token from session
    const token = req.session.token

    if (!token) {
      throw new errors.UnauthorizedError('Action is not allowed for anonymous')
    }
    if (config.PREVENT_XSRF === 'true') {
      if (!req.session.xsrfToken || req.session.xsrfToken.length === 0 ||
        req.session.xsrfToken !== req.header('xsrf-token')) {
        throw new errors.UnauthorizedError('XSRF token mismatches.')
      }
    }

    // Token must exist in DB
    User.findOne({where: { accessToken: token }})
      .then((user) => {
        if (!user) {
          return next(new errors.UnauthorizedError('Token is invalid'))
        }
        user = helper.decryptObj('User', user)

        // check token expiration
        if (new Date(user.accessTokenValidUntil) < new Date()) {
          return next(new errors.UnauthorizedError('Token expired'))
        }

        // Check role
        if (!_.includes(allowedRoles, user.role)) {
          return next(new errors.ForbiddenError(`Action is not allowed for ${user.role} role`))
        }

        // Set user to the request
        req.user = user
        return next()
      })
      .catch(e => {
        return next(e)
      })
  }
}

module.exports = auth
