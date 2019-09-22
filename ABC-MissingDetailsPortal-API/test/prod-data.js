/**
 * Insert test data to database
 */
require('../app-bootstrap')
const co = require('co')
const models = require('../src/models')
const logger = require('../src/common/logger')
const helper = require('../src/common/helper')
const constants = require('../app-constants')

co(function * () {
  yield models.User.create(helper.encryptObj('User', {
    employeeId: 'superuser',
    firstName: 'ABC',
    lastName: 'Super',
    email: 'super@test.com',
    role: constants.Roles.SuperUser,
    status: constants.UserStatuses.Active
  }))

  // email notifications setting
  yield models.ContractUserEmailSettings.create({
    emailsFrequency: constants.emailsFrequencies.OnceADay,
    newQueries: true,
    openQueries: true,
    closedQueries: false,
    rejectedQueries: false
  })

  // sla setting
  for (let i = 1; i <= 9; ++i) {
    yield models.QueryTypeSLA.create({
      number: 1,
      units: constants.TimeUnits.Days,
      exceptionTypeId: i
    })
  }
}).then(() => {
  logger.info('Test data are successfully inserted into database.')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})
