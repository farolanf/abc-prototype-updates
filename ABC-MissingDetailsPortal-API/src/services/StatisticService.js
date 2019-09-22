/**
 * This service provides operations to get statistics
 */
const logger = require('../common/logger')
const models = require('../models')
const constants = require('../../app-constants')
const Op = require('sequelize').Op

/**
 * Get global statistics
 * @param {Object} user the current user
 */
function * getGlobalStatistics (user) {
  let roleFilter = {}

  if (user.role === constants.Roles.DeliveryUser) {
    roleFilter = {
      [Op.or]: [
        {sdmId: user.id},
        {status: {[Op.in]: [constants.QueryStatuses.New, constants.QueryStatuses.Open]}}
      ]
    }
  }

  const numberOfTotalQueries = yield models.Query.count({ where: roleFilter })
  const numberOfNewQueries = yield models.Query.count({where: { [Op.and]: [roleFilter, { status: constants.QueryStatuses.New }] }})
  const numberOfOpenQueries = yield models.Query.count({where: { [Op.and]: [roleFilter, { status: constants.QueryStatuses.Open }] }})
  const numberOfClosedQueries = yield models.Query.count({where: { [Op.and]: [roleFilter, { status: constants.QueryStatuses.Closed }] }})
  const numberOfRejectedQueries = yield models.Query.count({where: { [Op.and]: [roleFilter, { status: constants.QueryStatuses.Rejected }] }})

  return {
    numberOfTotalQueries,
    numberOfNewQueries,
    numberOfOpenQueries,
    numberOfClosedQueries,
    numberOfRejectedQueries
  }
}

module.exports = {
  getGlobalStatistics
}

logger.buildService(module.exports)
