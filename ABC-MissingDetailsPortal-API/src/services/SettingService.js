/**
 * This service provides operations to manage settings
 */
const Joi = require('joi')
const helper = require('../common/helper')
const logger = require('../common/logger')
const models = require('../models')
const _ = require('lodash')
const constants = require('../../app-constants')
const JobService = require('./JobService')
const co = require('co')

/**
 * Get SLA settings
 * @returns {Object} the SLA settings
 */
function * getSLASettings () {
  const queryTypeSLAs = yield models.QueryTypeSLA.findAll()
  return { queryTypeSLAs }
}

/**
 * Save SLA settings
 * @param {Object} data the SLA setting data
 */
function * saveSLASettings (data) {
  yield models.sequelize.transaction(transaction => co(function * () {
    for (let i = 0; i < data.queryTypeSLAs.length; i += 1) {
      const sla = data.queryTypeSLAs[i]
      yield helper.ensureExist(models.ExceptionType, sla.exceptionTypeId)
      const setting = yield models.QueryTypeSLA.findOne({ where: { exceptionTypeId: sla.exceptionTypeId } })
      if (setting) {
        setting.number = sla.number
        setting.units = sla.units
        yield setting.save({ transaction })
      } else {
        yield models.QueryTypeSLA.create(_.omit(sla, 'id'), { transaction })
      }
    }
  }))
}

saveSLASettings.schema = {
  data: Joi.object().keys({
    queryTypeSLAs: Joi.array().items(Joi.object().keys({
      id: Joi.id().optional(),
      exceptionTypeId: Joi.id(),
      number: Joi.number().integer().min(0).required(),
      units: Joi.string().valid(_.values(constants.TimeUnits)).required()
    }).required()).required()
  }).required()
}

/**
 * Get email settings
 * @returns {Object} the email settings
 */
function * getEmailSettings () {
  const contractUserEmailSettings = yield models.ContractUserEmailSettings.findOne({})
  let deliveryAndManagementUserEmailSettings = yield models.DeliveryAndManagementUserEmailSettings.findOne({
    include: [{model: models.ExceptionType, as: 'exceptionTypes'}]
  })
  return { contractUserEmailSettings, deliveryAndManagementUserEmailSettings }
}

/**
 * Save email settings
 * @param {Object} data the email setting data
 */
function * saveEmailSettings (data) {
  yield models.sequelize.transaction(transaction => co(function * () {
    if (data.contractUserEmailSettings) {
      const setting = yield models.ContractUserEmailSettings.findOne({})
      if (setting) {
        _.assignIn(setting, data.contractUserEmailSettings)
        yield setting.save({ transaction })
      } else {
        yield models.ContractUserEmailSettings.create(data.contractUserEmailSettings, { transaction })
      }
    }
    if (data.deliveryAndManagementUserEmailSettings) {
      yield helper.validateIds(models.ExceptionType, data.deliveryAndManagementUserEmailSettings.exceptionTypeIds)
      let setting = yield models.DeliveryAndManagementUserEmailSettings.findOne({})
      const settingData = _.omit(data.deliveryAndManagementUserEmailSettings, ['exceptionTypeIds'])
      if (setting) {
        _.assignIn(setting, settingData)
        yield setting.save({ transaction })
      } else {
        setting = yield models.DeliveryAndManagementUserEmailSettings.create(settingData, { transaction })
      }
      yield setting.setExceptionTypes(data.deliveryAndManagementUserEmailSettings.exceptionTypeIds || [], { transaction })
    }
  }))
  // re-schedule email jobs
  yield JobService.scheduleEmailJobs()
}

saveEmailSettings.schema = {
  data: Joi.object().keys({
    contractUserEmailSettings: Joi.object().keys({
      emailsFrequency: Joi.string().required(),
      newQueries: Joi.boolean().required(),
      openQueries: Joi.boolean().required(),
      closedQueries: Joi.boolean().required(),
      rejectedQueries: Joi.boolean().required()
    }),
    deliveryAndManagementUserEmailSettings: Joi.object().keys({
      emailsFrequency: Joi.string().required(),
      newQueries: Joi.boolean().required(),
      openQueries: Joi.boolean().required(),
      closedQueries: Joi.boolean().required(),
      exceptionTypeIds: Joi.array().items(Joi.id().optional()).required()
    })
  }).min(1).required()
}

module.exports = {
  getSLASettings,
  saveSLASettings,
  getEmailSettings,
  saveEmailSettings
}

logger.buildService(module.exports)
