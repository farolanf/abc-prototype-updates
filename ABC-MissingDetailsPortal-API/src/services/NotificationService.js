/**
 * This service provides operations to manage Notification
 */
const Joi = require('joi')
const _ = require('lodash')
const Sequelize = require('sequelize')
const helper = require('../common/helper')
const logger = require('../common/logger')
const models = require('../models')
const constants = require('../../app-constants')

const Op = Sequelize.Op
const Notification = models.Notification
const NotificationStatuses = constants.NotificationStatuses

/**
 * Search notifications of the current user
 * @param {Object} criteria the search criteria
 * @param {Integer} userId the user id
 * @returns {Object} the search result
 */
function * search (criteria, userId) {
  const filter = {}

  const whereConditions = []
  whereConditions.push({userId})
  if (criteria.status) {
    whereConditions.push({status: criteria.status})
  }
  if (criteria.startDate) {
    whereConditions.push({createdOn: {[Op.gte]: criteria.startDate}})
  }
  if (criteria.endDate) {
    whereConditions.push({createdOn: {[Op.lte]: criteria.endDate}})
  }
  filter.where = {[Op.and]: whereConditions}

  filter.limit = criteria.perPage
  filter.offset = (criteria.page - 1) * criteria.perPage

  const searchResult = yield helper.findAndCountAll(Notification, filter)
  return _.assign(searchResult, {
    page: criteria.page,
    perPage: criteria.perPage
  })
}

search.schema = {
  criteria: Joi.object().keys({
    page: Joi.page(),
    perPage: Joi.perPage(),
    status: Joi.string().valid(_.values(NotificationStatuses)).allow(null),
    startDate: Joi.date(),
    endDate: Joi.date().when('startDate', {
      is: Joi.date().required(),
      then: Joi.date().min(Joi.ref('startDate'))
    })
  }),
  userId: Joi.id()
}

/**
 * Get a notification of the current user by id
 * @param {Integer} id the id
 * @param {Integer} userId the user id
 * @returns {Object} the company
 */
function * get (id, userId) {
  return yield helper.ensureExist(Notification, {where: {id, userId}})
}

get.schema = {
  id: Joi.id(),
  userId: Joi.id()
}

/**
 * Mark a notification of the current user as read
 * @param {Integer} id the id
 * @param {Integer} userId the user id
 * @returns {Object} the updated company
 */
function * markAsRead (id, userId) {
  const notification = yield helper.ensureExist(Notification, {where: {id, userId}})
  if (notification.status === NotificationStatuses.New) {
    yield notification.update({
      status: NotificationStatuses.Read,
      readOn: new Date()
    })
  }
}

markAsRead.schema = get.schema

/**
 * Mark all notification of the current user as read
 * @param {Integer} userId the user id
 */
function * markAllAsRead (userId) {
  yield Notification.update({
    status: NotificationStatuses.Read,
    readOn: new Date()
  }, {where: {userId, status: NotificationStatuses.New}})
}

markAllAsRead.schema = {
  userId: Joi.id()
}

module.exports = {
  search,
  get,
  markAsRead,
  markAllAsRead
}

logger.buildService(module.exports)
