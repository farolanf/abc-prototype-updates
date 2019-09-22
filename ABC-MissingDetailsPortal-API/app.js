/**
 * Initialize and start express application
 */
require('./app-bootstrap')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

const cors = require('cors')
const config = require('config')
const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const _ = require('lodash')
const logger = require('./src/common/logger')
const helper = require('./src/common/helper')
const co = require('co')
const path = require('path')
const JobService = require('./src/services/JobService')
const ms = require('ms')
const helmet = require('helmet')

const app = express()

// may need to add more to whitelist, see https://helmetjs.github.io/docs/csp/
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ['\'self\'']
  }
}))

app.use(helmet({
  frameguard: {
    action: 'SAMEORIGIN'
  }
}))

app.use(cors({
  credentials: true,
  origin: config.ALLOWED_ORIGINS
}))
// public content
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

function decryptSessionSecretFromConfigFile () {
  return helper.decrypt(config.ENCRYPTED_SESSION_SECRET)
}
const sessionSecret = decryptSessionSecretFromConfigFile()
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: ms(config.COOKIE_MAX_AGE)
  }
}))

// Request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('common', { skip: (req, res) => res.statusCode < 400 }))
}

// Register routes
require('./app-routes')(app)

// The error handler, log error and return 500 error
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.logFullError(err, req.signature || `${req.method} ${req.url}`)
  const errorResponse = {}
  const status = err.isJoi ? 400 : (err.httpStatus || 500)

  if (_.isArray(err.details)) {
    if (err.isJoi) {
      _.map(err.details, (e) => {
        if (e.message) {
          if (_.isUndefined(errorResponse.message)) {
            errorResponse.message = e.message
          } else {
            errorResponse.message += `, ${e.message}`
          }
        }
      })
    }
  }
  if (_.isUndefined(errorResponse.message)) {
    if (err.message) {
      errorResponse.message = err.message
    } else {
      errorResponse.message = 'Internal server error'
    }
  }

  res.status(status).json(errorResponse)
})

// Listen
app.listen(config.PORT, '0.0.0.0', () => {
  logger.info('Express server listening on port %d', config.PORT)
})

// schedule jobs
co(function * () {
  yield JobService.scheduleEmailJobs()
  yield JobService.scheduleFileCleanerJobs()
}).then(() => {
  logger.info('Finished scheduling jobs.')
}).catch((e) => {
  logger.error('Failed to schedule jobs.')
  logger.logFullError(e)
})
