/**
 * Initialize and export all model schemas
 */
const config = require('config')
const Sequelize = require('sequelize')

const sequelize = new Sequelize(config.DB_URL, {
  logging: false,
  operatorsAliases: false,
  dialect: 'mssql',
  dialectOptions: {
    encrypt: true
  }
})
const models = { sequelize }

// Definitions
models.User = sequelize.import('./User')
models.Notification = sequelize.import('./Notification')
models.File = sequelize.import('./File')
models.Query = sequelize.import('./Query')
models.Currency = sequelize.import('./Currency')
models.Country = sequelize.import('./Country')
models.ExceptionType = sequelize.import('./ExceptionType')
models.SDMComment = sequelize.import('./SDMComment')
models.QueryTypeSLA = sequelize.import('./QueryTypeSLA')
models.ContractUserEmailSettings = sequelize.import('./ContractUserEmailSettings')
models.DeliveryAndManagementUserEmailSettings = sequelize.import('./DeliveryAndManagementUserEmailSettings')

// Associations
models.User.belongsTo(models.File, { as: 'profilePicture', foreignKey: 'profilePictureId' })
models.Notification.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })

models.Query.belongsTo(models.ExceptionType, { as: 'exceptionType', foreignKey: 'exceptionTypeId' })
models.Query.belongsTo(models.Country, { as: 'country', foreignKey: 'countryId' })
models.Query.belongsTo(models.Currency, { as: 'currency', foreignKey: 'currencyId' })
models.Query.belongsTo(models.User, { as: 'sdm', foreignKey: 'sdmId' })
models.Query.belongsTo(models.User, { as: 'requestor', foreignKey: 'requestorId' })
models.Query.belongsToMany(models.User, { through: 'QueryWatcher', timestamp: false, as: 'watchers' })
models.User.belongsToMany(models.Query, { through: 'QueryWatcher', timestamp: false, as: 'watchedQueries' })
models.Query.belongsToMany(models.File, { through: 'QueryFile', timestamp: false, as: 'attachments' })
models.Query.belongsToMany(models.SDMComment, { through: 'SDMCommentQuery', timestamp: false, as: 'sdmComments' })
models.SDMComment.belongsToMany(models.Query, { through: 'SDMCommentQuery', timestamp: false, as: 'queries' })

models.SDMComment.belongsTo(models.User, { as: 'sdm', foreignKey: 'sdmId' })
models.SDMComment.belongsToMany(models.File, { through: 'SDMCommentFile', timestamp: false, as: 'attachments' })

models.DeliveryAndManagementUserEmailSettings.belongsToMany(models.ExceptionType,
  { through: 'DeliveryAndManagementUserEmailSettingsExceptionType', timestamp: false, as: 'exceptionTypes' })

models.QueryTypeSLA.belongsTo(models.ExceptionType, { as: 'exceptionType', foreignKey: 'exceptionTypeId' })

module.exports = models
