/**
 * App bootstrap
 */
global.Promise = require('bluebird')
const Joi = require('joi')
const config = require('config')
const fs = require('fs')
const path = require('path')
const helper = require('./src/common/helper')
const logger = require('./src/common/logger')

Joi.id = () => Joi.number().integer().positive().required()
Joi.page = () => Joi.number().integer().positive().default(Number(config.DEFAULT_PAGE_INDEX))
Joi.perPage = () => Joi.number().integer().positive().max(100).default(Number(config.DEFAULT_PER_PAGE))
Joi.sortOrder = () => Joi.string().valid('asc', 'desc').default('desc')

const configPath = path.join(__dirname, 'config/default.js')
let configContent
let configUpdated = false

if (config.DB_URL.startsWith('mssql://')) {
  // encrypt the DB URL, and update config file
  const encryptedDBUrl = helper.encryptDBUrl(config.DB_URL)
  configContent = fs.readFileSync(configPath, 'UTF8')
  const str = 'DB_URL: process.env.DB_URL || \''
  let start = configContent.indexOf(str)
  if (start >= 0) {
    start += str.length
    const end = configContent.indexOf('\',', start)
    if (end >= 0) {
      configContent = configContent.substring(0, start) + encryptedDBUrl + configContent.substring(end)
      configUpdated = true
      logger.info('DB URL is encrypted.')
    }
  }
} else {
  // decrypt the DB URL
  config.DB_URL = helper.decryptDBUrl(config.DB_URL)
}

if (config.SESSION_SECRET && config.SESSION_SECRET.length > 0) {
  // encrypt session secret, and move encrypted value to ENCRYPTED_SESSION_SECRET
  if (!configContent) {
    configContent = fs.readFileSync(configPath, 'UTF8')
  }
  const encryptedSecret = helper.encrypt(config.SESSION_SECRET)
  let newContent = configContent

  const str = 'SESSION_SECRET: process.env.SESSION_SECRET || \''
  let start = configContent.indexOf(str)
  if (start >= 0) {
    start += str.length
    const end = configContent.indexOf('\',', start)
    if (end >= 0) {
      newContent = configContent.substring(0, start) + configContent.substring(end)
      logger.info('SESSION_SECRET value is removed.')
    }
  }
  config.SESSION_SECRET = ''

  const str2 = 'ENCRYPTED_SESSION_SECRET: process.env.ENCRYPTED_SESSION_SECRET || \''
  let start2 = newContent.indexOf(str2)
  if (start2 >= 0) {
    start2 += str2.length
    const end2 = newContent.indexOf('\',', start2)
    if (end2 >= 0) {
      configContent = newContent.substring(0, start2) + encryptedSecret + newContent.substring(end2)
      configUpdated = true
      logger.info('SESSION_SECRET is encrypted and put to ENCRYPTED_SESSION_SECRET.')
    }
  }
  config.ENCRYPTED_SESSION_SECRET = encryptedSecret
}

if (!config.ENCRYPTED_SESSION_SECRET || config.ENCRYPTED_SESSION_SECRET.length === 0) {
  throw new Error('Missing ENCRYPTED_SESSION_SECRET.')
}

if (configUpdated) {
  fs.writeFileSync(configPath, configContent)
  logger.info('Config file is updated.')
}
