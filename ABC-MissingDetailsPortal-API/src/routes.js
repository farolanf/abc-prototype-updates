/**
 * Contains all routes
 */
const _ = require('lodash')
const constants = require('../app-constants')

const allRoles = _.values(constants.Roles)

module.exports = {
  '/saml/metadata.xml': {
    get: { controller: 'AuthController', method: 'getSPMeta' }
  },
  '/saml/login': {
    get: { controller: 'AuthController', method: 'login' }
  },
  '/saml/assert': {
    post: { controller: 'AuthController', method: 'assert' }
  },
  '/logout': {
    post: { controller: 'AuthController', method: 'logout', auth: allRoles }
  },
  '/users': {
    get: { controller: 'UserController', method: 'search', auth: allRoles },
    post: { controller: 'UserController', method: 'create', auth: [constants.Roles.SuperUser] }
  },
  '/users/:id': {
    get: { controller: 'UserController', method: 'get', auth: allRoles },
    put: { controller: 'UserController', method: 'update', auth: [constants.Roles.SuperUser] },
    patch: { controller: 'UserController', method: 'updatePartially', auth: [constants.Roles.SuperUser] },
    delete: { controller: 'UserController', method: 'remove', auth: [constants.Roles.SuperUser] }
  },
  '/me': {
    get: { controller: 'UserController', method: 'getMe', auth: allRoles }
  },
  '/queries': {
    get: { controller: 'QueryController', method: 'search', auth: allRoles },
    post: { controller: 'QueryController', method: 'create', auth: [constants.Roles.ContractAdminUser] }
  },
  '/queries/:id': {
    get: { controller: 'QueryController', method: 'get', auth: allRoles },
    put: { controller: 'QueryController', method: 'update', auth: [constants.Roles.ContractAdminUser] },
    patch: { controller: 'QueryController', method: 'updatePartially', auth: [constants.Roles.ContractAdminUser] }
  },
  '/reassignQueries': {
    patch: { controller: 'QueryController', method: 'reassign', auth: allRoles }
  },
  '/importQueries': {
    post: { controller: 'QueryController', method: 'importQueries', auth: [constants.Roles.ContractAdminUser], file: 'file' }
  },
  '/queries/:id/watch': {
    put: {controller: 'QueryController', method: 'watch', auth: allRoles}
  },
  '/queries/:id/unwatch': {
    put: {controller: 'QueryController', method: 'unwatch', auth: allRoles}
  },
  '/queries/:id/watchers': {
    get: {controller: 'QueryController', method: 'getWatchers', auth: allRoles},
    patch: { controller: 'QueryController', method: 'updateWatchers', auth: allRoles }
  },
  '/queries/:id/sdmComment': {
    get: {controller: 'QueryController', method: 'getSDMCommentOfQuery', auth: allRoles}
  },
  '/sdmComments': {
    post: { controller: 'QueryController', method: 'createSDMComment', auth: allRoles }
  },
  '/sdmComments/:id': {
    get: { controller: 'QueryController', method: 'getSDMComment', auth: allRoles }
  },
  '/files': {
    post: { controller: 'FileController', method: 'create', auth: allRoles, file: 'file' }
  },
  '/files/:id': {
    delete: { controller: 'FileController', method: 'remove', auth: allRoles }
  },
  '/notifications': {
    get: { controller: 'NotificationController', method: 'search', auth: allRoles }
  },
  '/notifications/:id': {
    get: { controller: 'NotificationController', method: 'get', auth: allRoles }
  },
  '/notifications/:id/read': {
    put: { controller: 'NotificationController', method: 'markAsRead', auth: allRoles }
  },
  '/markAllNotificationsAsRead': {
    put: { controller: 'NotificationController', method: 'markAllAsRead', auth: allRoles }
  },
  '/countries': {
    get: { controller: 'LookupController', method: 'getCountries', auth: allRoles }
  },
  '/currencies': {
    get: { controller: 'LookupController', method: 'getCurrencies', auth: allRoles }
  },
  '/exceptionTypes': {
    get: { controller: 'LookupController', method: 'getExceptionTypes', auth: allRoles }
  },
  '/globalStatistics': {
    get: { controller: 'StatisticController', method: 'getGlobalStatistics', auth: allRoles }
  },
  '/slaSettings': {
    get: { controller: 'SettingController', method: 'getSLASettings', auth: [constants.Roles.SuperUser] },
    put: { controller: 'SettingController', method: 'saveSLASettings', auth: [constants.Roles.SuperUser] }
  },
  '/emailSettings': {
    get: { controller: 'SettingController', method: 'getEmailSettings', auth: [constants.Roles.SuperUser] },
    put: { controller: 'SettingController', method: 'saveEmailSettings', auth: [constants.Roles.SuperUser] }
  },
  '/autoSuggest/exceptionTypes': {
    get: { controller: 'AutoSuggestController', method: 'suggestExceptionTypes', auth: allRoles }
  },
  '/autoSuggest/countries': {
    get: { controller: 'AutoSuggestController', method: 'suggestCountries', auth: allRoles }
  },
  '/autoSuggest/currencies': {
    get: { controller: 'AutoSuggestController', method: 'suggestCurrencies', auth: allRoles }
  },
  '/autoSuggest/accountNames': {
    get: { controller: 'AutoSuggestController', method: 'suggestAccountNames', auth: allRoles }
  },
  '/autoSuggest/ampids': {
    get: { controller: 'AutoSuggestController', method: 'suggestAMPIds', auth: allRoles }
  },
  '/autoSuggest/sapContracts': {
    get: { controller: 'AutoSuggestController', method: 'suggestSapContracts', auth: allRoles }
  }
}
