/**
 * This service provides operations to manage User
 */
const Joi = require('joi')
const Sequelize = require('sequelize')
const _ = require('lodash')
const moment = require('moment')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const models = require('../models')
const constants = require('../../app-constants')

const Op = Sequelize.Op
const User = models.User

/**
 * Return cleaned user object to return to front end
 * @param {Object} user the user
 * @returns {Object} cleaned user object
 * @private
 */
function cleanUser (user) {
  const userJson = user.toJSON ? user.toJSON() : user
  delete userJson.accessToken
  delete userJson.accessTokenValidUntil
  return userJson
}

/**
 * Search users
 * @param {Object} criteria the search criteria
 * @returns {Object} the search result
 */
function * search (criteria) {
  const filter = {}

  const whereConditions = []
  if (criteria.keyword) {
    const keywordCondition = {[Op.like]: `%${criteria.keyword}%`}
    whereConditions.push({
      [Op.or]: [
        {firstName: keywordCondition},
        {lastName: keywordCondition},
        {employeeId: keywordCondition},
        {email: keywordCondition}
      ]
    })
  }

  if (criteria.roles) {
    criteria.roles = criteria.roles.split(',')
    _.each(criteria.roles, role => {
      if (role.trim().length === 0) {
        throw new errors.BadRequestError('Role can not be empty.')
      }
    })
    whereConditions.push({
      role: {[Op.in]: criteria.roles}
    })
  }

  if (criteria.name) {
    whereConditions.push({
      [Op.or]: [
        {firstName: {[Op.like]: `%${criteria.name}%`}},
        {lastName: {[Op.like]: `%${criteria.name}%`}}
      ]
    })
  }

  if (criteria.createdOn) {
    whereConditions.push({
      createdOn: {
        [Op.gte]: moment(criteria.createdOn).toDate(),
        [Op.lt]: moment(criteria.createdOn).add(24, 'h').toDate()
      }
    })
  }

  if (criteria.email) {
    whereConditions.push({
      email: {
        [Op.like]: `%${criteria.email}%`
      }
    })
  }

  if (criteria.status) {
    whereConditions.push({
      status: criteria.status
    })
  }

  filter.where = {[Op.and]: whereConditions}

  if (criteria.sortBy === 'name') {
    filter.order = [
      ['firstName', criteria.sortOrder],
      ['lastName', criteria.sortOrder]
    ]
  } else {
    filter.order = [
      [criteria.sortBy, criteria.sortOrder]
    ]
  }
  if (filter.order[0][0] !== 'id') {
    filter.order.push(['id', 'asc'])
  }

  filter.limit = criteria.perPage
  filter.offset = (criteria.page - 1) * criteria.perPage

  const searchResult = yield helper.findAndCountAll(User, filter)
  searchResult.results = _.map(searchResult.results, (u) => {
    u = helper.decryptObj('User', u)
    return cleanUser(u)
  })

  return _.assign(searchResult, {
    page: criteria.page,
    perPage: criteria.perPage
  })
}

search.schema = {
  criteria: Joi.object().keys({
    page: Joi.page(),
    perPage: Joi.perPage(),
    sortBy: Joi.string().valid('id', 'name', 'role', 'status', 'createdOn', 'email').default('id'),
    sortOrder: Joi.sortOrder(),
    keyword: Joi.string(),
    roles: Joi.string(),
    name: Joi.string(),
    createdOn: Joi.date(),
    email: Joi.string(),
    status: Joi.string().valid(_.values(constants.UserStatuses))
  })
}

/**
 * Create user
 * @param {Object} user the user to create
 * @returns {Object} the created user
 */
function * create (user) {
  // data before encryption
  const theEmail = user.email
  const theEmployeeId = user.employeeId
  user = helper.encryptObj('User', user)
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@mps\.com$/
  if (!re.test(String(theEmail).toLowerCase())) {
    throw new errors.BadRequestError('Email from other domains is not allowed')
  }
  if (yield models.User.findOne({where: {email: user.email}})) {
    throw new errors.ValidationError(`Email: ${theEmail} is already used.`)
  }
  if (yield models.User.findOne({where: {employeeId: user.employeeId}})) {
    throw new errors.ValidationError(`The employee id: ${theEmployeeId} is already used.`)
  }
  let res = yield User.create(user)
  res = helper.decryptObj('User', res)
  return cleanUser(res)
}

create.schema = {
  user: Joi.object().keys({
    employeeId: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().required(),
    role: Joi.string().valid(_.values(constants.Roles)).required(),
    status: Joi.string().valid(_.values(constants.UserStatuses)).required(),
    profilePictureId: Joi.id().optional()
  }).required()
}

/**
 * Get user by id
 * @param {Integer} id the id
 * @returns {Object} the user
 */
function * get (id) {
  let user = yield helper.ensureExist(User, {where: {id}, include: ['profilePicture']})
  user = helper.decryptObj('User', user)
  return cleanUser(user)
}

get.schema = {
  id: Joi.id()
}

/**
 * Update user
 * @param {Integer} id the id
 * @param {Object} user the user
 * @returns {Object} the updated user
 */
function * update (id, user) {
  return yield updatePartially(id, user)
}

update.schema = {
  id: Joi.id(),
  user: create.schema.user
}

/**
 * Update user partially
 * @param {Integer} id the id
 * @param {Object} user the user
 * @returns {Object} the updated user
 */
function * updatePartially (id, user) {
  // data before encryption
  const theEmail = user.email
  const theEmployeeId = user.employeeId
  user = helper.encryptObj('User', user)
  const existing = yield helper.ensureExist(User, id)
  let u = yield models.User.findOne({where: {email: user.email}})
  if (u && Number(u.id) !== id) {
    throw new errors.ValidationError(`Email: ${theEmail} is already used.`)
  }
  u = yield models.User.findOne({where: {employeeId: user.employeeId}})
  if (u && Number(u.id) !== id) {
    throw new errors.ValidationError(`The employee id: ${theEmployeeId} is already used.`)
  }
  _.assignIn(existing, user)
  let res = yield existing.save()
  res = helper.decryptObj('User', res)
  return cleanUser(res)
}

updatePartially.schema = {
  id: Joi.id(),
  user: Joi.object().keys({
    employeeId: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string(),
    role: Joi.string().valid(_.values(constants.Roles)),
    status: Joi.string().valid(_.values(constants.UserStatuses)),
    profilePictureId: Joi.id().optional()
  })
}

/**
 * Delete user by id
 * @param {Integer} id the id
 */
function * remove (id) {
  yield helper.findOneAndRemove(User, id)
}

remove.schema = {
  id: Joi.id()
}

module.exports = {
  search,
  create,
  get,
  update,
  updatePartially,
  remove
}

logger.buildService(module.exports)
