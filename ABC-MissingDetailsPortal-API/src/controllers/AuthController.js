/**
 * Controller for authentication endpoints
 */
const service = require('../services/AuthService')
const config = require('config')
const uuid = require('uuid/v4')
const ms = require('ms')
const constants = require('../../app-constants')
const errors = require('../common/errors')

/**
 * Login by email and password
 * @param req the request
 * @param res the response
 */
function * login (req, res) {
  const loginUrl = yield service.login()
  res.redirect(loginUrl)
}

/**
 * Logout
 * @param req the request
 * @param res the response
 */
function * logout (req, res) {
  req.session.token = null
  if (config.PREVENT_XSRF === 'true') {
    req.session.xsrfToken = null
  }
  yield service.logout(req.user)
  res.status(204).end()
}

/**
 * Get SAML service provider meta
 * @param req the request
 * @param res the response
 */
function * getSPMeta (req, res) {
  res.type('application/xml')
  res.send(yield service.getSPMeta())
}

/**
 * verify saml authorization response
 * @param req the request
 * @param res the response
 */
function * assert (req, res) {
  try {
    const result = yield service.assert(req)
    req.session.token = result.token
    if (config.PREVENT_XSRF === 'true') {
      const xsrfToken = uuid()
      req.session.xsrfToken = xsrfToken
      res.cookie('xsrf-token', xsrfToken, {
        maxAge: ms(config.COOKIE_MAX_AGE),
        secure: process.env.NODE_ENV === 'production'
      })
    }
    if (result.user.role === constants.Roles.SuperUser) {
      res.redirect(`${config.APP_BASE_URL}/usersManagementPage`)
    } else {
      res.redirect(`${config.APP_BASE_URL}/dashboard`)
    }
  } catch (ex) {
    if (ex instanceof errors.UnauthorizedError) {
      res.redirect(`${config.APP_BASE_URL}/login?message=${Buffer.from(ex.message).toString('base64')}`)
    } else {
      throw ex
    }
  }
}

module.exports = {
  login,
  logout,
  getSPMeta,
  assert
}
