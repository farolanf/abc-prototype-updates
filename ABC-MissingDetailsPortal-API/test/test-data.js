/**
 * Insert test data to database
 */
require('../app-bootstrap')
const co = require('co')
const _ = require('lodash')
const models = require('../src/models')
const logger = require('../src/common/logger')
const helper = require('../src/common/helper')
const constants = require('../app-constants')

co(function * () {
  // create a file
  yield models.File.create({ name: 'file1', mimeType: 'text/plain', fileURL: 'http://test.com/file1.txt' })

  // profile picture
  const avatar1 = yield models.File.create({
    name: 'demo delivery user avatar',
    mimeType: 'image/jpeg',
    fileURL: 'i/logger@2x.jpg'
  })
  const avatar2 = yield models.File.create({
    name: 'demo management user avatar',
    mimeType: 'image/jpeg',
    fileURL: 'i/management_user.jpg'
  })
  const avatar3 = yield models.File.create({
    name: 'demo contract admin user avatar',
    mimeType: 'image/jpeg',
    fileURL: 'i/contract_admin.jpg'
  })
  const avatar4 = yield models.File.create({
    name: 'demo super user avatar',
    mimeType: 'image/jpeg',
    fileURL: 'i/super_user.jpg'
  })

  const deliveryUsers = []
  const contractAdminUsers = []
  // create users
  for (let i = 0; i < 10; ++i) {
    deliveryUsers.push(yield models.User.create(helper.encryptObj('User', {
      employeeId: 'delivery' + i,
      firstName: 'first' + i,
      lastName: 'last' + i,
      email: `delivery${i > 0 ? i : ''}@test.com`,
      role: constants.Roles.DeliveryUser,
      status: constants.UserStatuses.Active,
      profilePictureId: avatar1.id
    })))
    yield models.User.create(helper.encryptObj('User', {
      employeeId: 'management' + i,
      firstName: 'first' + i,
      lastName: 'last' + i,
      email: `management${i > 0 ? i : ''}@test.com`,
      role: constants.Roles.ManagementUser,
      status: constants.UserStatuses.Active,
      profilePictureId: avatar2.id
    }))
    contractAdminUsers.push(yield models.User.create(helper.encryptObj('User', {
      employeeId: 'contract-admin' + i,
      firstName: 'first' + i,
      lastName: 'last' + i,
      email: `contract-admin${i > 0 ? i : ''}@test.com`,
      role: constants.Roles.ContractAdminUser,
      status: constants.UserStatuses.Active,
      profilePictureId: avatar3.id
    })))
  }

  yield models.User.create(helper.encryptObj('User', {
    employeeId: 'super',
    firstName: 'first4',
    lastName: 'last4',
    email: 'super@test.com',
    role: constants.Roles.SuperUser,
    status: constants.UserStatuses.Active,
    profilePictureId: avatar4.id
  }))

  // create some notifications and queries
  for (let i = 1; i <= 100; i += 1) {
    yield models.Notification.create({
      title: `title ${i}`,
      text: `text ${i}`,
      relatedModel: 'Query',
      relatedModelId: 1,
      notificationType: constants.NotificationTypes.NewQueries,
      status: constants.NotificationStatuses.New,
      userId: i % 10 + 1
    })

    const q = yield models.Query.create(helper.encryptObj('Query', {
      exceptionSubType: `exception sub type ${i}`,
      accountName: `account name ${i}`,
      ampId: i % 4 + 1,
      billingIndex: `index ${i}`,
      billingStartDate: new Date(),
      billingEndDate: new Date(),
      sapContract: `contract ${i}`,
      valueToBeBilled: i * 10,
      dueDate: new Date(),
      reviseDate: new Date(),
      openedDate: new Date(),
      closedDate: new Date(),
      rework: true,
      reworkReason: `reason ${i}`,
      dmpsPmps: `dmps pmps ${i}`,
      status: _.sample(_.values(constants.QueryStatuses)),
      exceptionTypeId: i % 4 + 1,
      countryId: i % 4 + 1,
      currencyId: i % 4 + 1,
      sdmId: _.sample(deliveryUsers).id,
      requestorId: _.sample(contractAdminUsers).id,
      comment: 'comment',
      priority: 'High'
    }))
    yield q.setAttachments([1])
  }

  // create SDM comment
  const sdmComment = yield models.SDMComment.create(helper.encryptObj('SDMComment', {
    text: 'some SDM comment',
    status: constants.QueryStatuses.New,
    sdmId: 1
  }))
  yield sdmComment.setAttachments([1])
  yield sdmComment.setQueries([1, 2, 3, 4])

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

  // query watcher
  for (let i = 1; i <= 10; ++i) {
    const query = yield models.Query.findById(i)
    yield query.addWatcher(1)
    yield query.addWatcher(2)
  }
}).then(() => {
  logger.info('Test data are successfully inserted into database.')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})
