/**
 * Insert lookup data to database
 */
require('../app-bootstrap')
const co = require('co')
const models = require('../src/models')
const logger = require('../src/common/logger')

co(function * () {
  for (let i = 1; i <= 10; i += 1) {
    yield models.Country.create({ name: `country${i}` })
    yield models.Currency.create({ name: `currency${i}`, symbol: `s${i}` })
  }

  const exceptionTypes = ['Missing Info Change Orders', 'Click Report', 'Consumption Report', 'Missing Info EOT', 'Pricing issues', 'IBR approval', 'Others', 'DRS', 'Under ATR - Business decision needs']
  for (let i = 0; i < exceptionTypes.length; ++i) {
    yield models.ExceptionType.create({name: exceptionTypes[i]})
  }
}).then(() => {
  logger.info('Lookup data are successfully inserted into database.')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})
