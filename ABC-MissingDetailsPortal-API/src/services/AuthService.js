/**
 * This service provides authentication-related operations
 */
const _ = require('lodash')
const Joi = require('joi')
const config = require('config')
const logger = require('../common/logger')
const errors = require('../common/errors')
const helper = require('../common/helper')
const models = require('../models')
const ms = require('ms')
const uuid = require('uuid/v4')
const constants = require('../../app-constants')
const saml2 = require('saml2-js')
const fs = require('fs')

// Create service provider
const spOptions = {
  entity_id: config.SAML.SERVICE_PROVIDER.ENTITY_ID,
  private_key: fs.readFileSync(config.SAML.SERVICE_PROVIDER.PRIVATE_KEY).toString(),
  certificate: fs.readFileSync(config.SAML.SERVICE_PROVIDER.CERTIFICATE).toString(),
  assert_endpoint: config.SAML.SERVICE_PROVIDER.ASSERT_ENDPOINT
}
const sp = new saml2.ServiceProvider(spOptions)

// Create identity provider
const idpOptions = {
  sso_login_url: config.SAML.IDENTITY_PROVIDER.SSO_LOGIN_URL,
  sso_logout_url: '',
  certificates: [fs.readFileSync(config.SAML.IDENTITY_PROVIDER.CERTIFICATE).toString()]
}
const idp = new saml2.IdentityProvider(idpOptions)

const User = models.User

/**
 * Login by email (which may be email or user name (employee id)) and password
 * @param {Object} credentials the credentials
 * @returns {Object} the token information
 */
function * login () {
  const promise = new Promise((resolve, reject) => {
    sp.create_login_request_url(idp, {}, (err, loginUrl) => {
      if (err) { reject(err) } else { resolve(loginUrl) }
    })
  })

  return yield promise
}

login.schema = {}

/**
 * verify saml authorization response
 * @param req the request
 */
function * assert (req) {
  const options = {request_body: req.body}
  const promise = new Promise((resolve, reject) => {
    sp.post_assert(idp, options, (err, samlResponse) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          email: samlResponse.user.name_id,
          employeeId: _.get(samlResponse.user, 'attributes.employeeId[0]'),
          firstName: _.get(samlResponse.user, 'attributes.firstName[0]'),
          lastName: _.get(samlResponse.user, 'attributes.lastName[0]'),
          sessionIndex: samlResponse.user.session_index
        })
      }
    })
  })

  const user = yield promise.catch(() => {
    throw new errors.UnauthorizedError('Unauthorized user')
  })

  // check if user is added to this app
  let dbUser = yield User.findOne({where: {email: user.email}, include: ['profilePicture']})
  if (!dbUser) {
    throw new errors.UnauthorizedError('The user is not added to this app')
  }
  dbUser = helper.decryptObj('User', dbUser)
  if (dbUser.status !== constants.UserStatuses.Active) {
    throw new errors.UnauthorizedError('The user is not active')
  }
  // save user data from SSO
  _.assignIn(dbUser, _.pick(user, ['employeeId', 'firstName', 'lastName']))
  // generate token
  const token = helper.encrypt(uuid())
  dbUser.accessToken = token
  dbUser.accessTokenValidUntil = new Date(new Date().getTime() + ms(config.TOKEN_EXPIRATION))
  const res = { token, user: _.omit(dbUser.toJSON(), ['accessToken', 'accessTokenValidUntil', 'profilePictureId']) }
  dbUser = helper.encryptObj('User', dbUser)
  yield dbUser.save()
  return res
}

/**
 * Logout
 * @param {Object} user the current user
 */
function * logout (user) {
  user.accessToken = null
  user.accessTokenValidUntil = null
  user = helper.encryptObj('User', user)
  yield user.save()
}

logout.schema = {
  // we don't need to fully validate user, because it is not REST input, it is set internally
  user: Joi.object().required()
}

/**
 * Get SAML service provider meta
 */
function * getSPMeta () {
  return sp.create_metadata()
}

getSPMeta.schema = {}

module.exports = {
  login,
  logout,
  getSPMeta,
  assert
}

logger.buildService(module.exports)
