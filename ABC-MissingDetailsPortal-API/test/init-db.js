/**
 * Initialize database tables.
 */
require('../app-bootstrap')
const models = require('../src/models')
const logger = require('../src/common/logger')

logger.info('Initialize database tables...')

models.sequelize.sync({ force: true })
  .then(() => {
    logger.info(`Initialize database tables - COMPLETED`)
    process.exit()
  })
  .catch((err) => {
    logger.logFullError(err)
    process.exit(1)
  })
