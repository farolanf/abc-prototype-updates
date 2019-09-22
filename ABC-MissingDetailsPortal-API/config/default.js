/**
 * The default configuration file
 */
const path = require('path')
const fs = require('fs')

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  API_PREFIX: process.env.API_PREFIX || '/api/1.0',
  // scheme and host info of the api service, used to construct uploaded file URL
  API_SCHEME_HOST: process.env.API_SCHEME_HOST || 'http://localhost',
  // sample DB URL: mssql://SA:Strong!Passw0rd@localhost/abc
  // this can be either plain text or encrypted, if it is plain text, it will be encypted and this config
  // file will be updated with encrypted DB URL when the app starts
  DB_URL: process.env.DB_URL || '2909e67d2257095736414c7d2a5b850d62006ca9faa6fb5142ee3e7567057851d627cebb70b017c62d6d9974084aa629MfjOiDjoHzpnBasAhrjJ3UScXOHKFRf3l6kMZENM7oe/HbrawChKtYaZwdgZsCagczA4QfW9WR5suKERGOkTtNg9mDnack2ioaJZy7H3dCY=',
  // base URL of the app, used to construct redirect URL
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:8888',
  // if session secret is present, it will be enrypted and put as default value for ENCRYPTED_SESSION_SECRET,
  // and then the session secret is removed, config file is updated
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  ENCRYPTED_SESSION_SECRET: process.env.ENCRYPTED_SESSION_SECRET || 'cb27b198c43d3474e1bb03e215256c128ce0cd5bc62231af6df5fe0261fd77af84a8e855dbf1b0c299d40ccec2452f12sje9whcf1ePwwo/MYtmSW7le8mrGdCxY3LUtH6EIUcE=',
  // a string of time span, see https://github.com/zeit/ms
  COOKIE_MAX_AGE: process.env.COOKIE_MAX_AGE || '10 days',
  // 'true' or 'false'
  PREVENT_XSRF: process.env.PREVENT_XSRF || 'false',

  // used to encrypt/decrypt DB URL
  DB_URL_ENCRYPTION_KEY: process.env.DB_URL_ENCRYPTION_KEY || 'tjlk12358ux872ttx894837bhwysyxgwta',
  // used to encrypt/decrypt entities fields and session secret
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'fjlki458fux8728374837bhwytposyxgwtx',
  // a string of time span, see https://github.com/zeit/ms
  TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || '100 days',

  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@mps.com',
  EMAIL: {
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || 'user',
      pass: process.env.SMTP_PASSWORD || 'password'
    }
  },

  // default due date period used to calculate due date of query
  // a string of time span, see https://github.com/zeit/ms
  DEFAULT_DUE_DATE_PERIOD: process.env.DEFAULT_DUE_DATE_PERIOD || '5 days',

  // Default paging
  DEFAULT_PAGE_INDEX: process.env.DEFAULT_PAGE_INDEX || 1,
  DEFAULT_PER_PAGE: process.env.DEFAULT_PER_PAGE || 20,

  // only string fields are supported, if a field is encrypted, it can not search data against that field,
  // can not include 'status' field
  ENCRYPTED_QUERY_FIELDS: (process.env.ENCRYPTED_QUERY_FIELDS && process.env.ENCRYPTED_QUERY_FIELDS.split(',')) ||
    ['billingIndex'],
  // only string fields are supported, can include only employeeId/firstName/lastName,
  // if a field is encrypted, it can not search data against that field
  ENCRYPTED_USER_FIELDS: (process.env.ENCRYPTED_USER_FIELDS && process.env.ENCRYPTED_USER_FIELDS.split(',')) ||
    [],
  // only string fields are supported, can include only 'text' field
  ENCRYPTED_SDMCOMMENT_FIELDS:
    (process.env.ENCRYPTED_SDMCOMMENT_FIELDS && process.env.ENCRYPTED_SDMCOMMENT_FIELDS.split(',')) || ['text'],

  FREQUENCIES: {
    // key is frequency string, if a frequency string is not configured, then it won't be scheduled;
    // value is CRON schedule string, see (https://www.npmjs.com/package/node-schedule) for CRON string format
    'OnceADay': '0 0 0 * * *', // run every minute for testing, in production it should run once a day
    'OnceAWeek': '0 0 0 * * 1' // run every minute for testing, in production it should run twice a day
  },
  // run every minute for testing
  UNUSED_FILES_CLEANER_JOB_SCHEDULE: process.env.UNUSED_FILES_CLEANER_JOB_SCHEDULE || '0 * * * * *',
  // file created less than this period won't be deleted by the file cleaner job
  // a string of time span, see https://github.com/zeit/ms
  FILE_RETAINING_PERIOD: process.env.FILE_RETAINING_PERIOD || '30m',

  QUERY_DATA_EMAIL_SUBJECT: process.env.QUERY_DATA_EMAIL_SUBJECT || 'MPS Front End Portal Missing Info Query Dashboard',
  QUERY_DATA_EMAIL_BODY: process.env.QUERY_DATA_EMAIL_BODY || fs.readFileSync(path.join(__dirname, '../templates/queryEmailBody.pug')),
  IMPORT_FAILURE_EMAIL_SUBJECT: process.env.IMPORT_FAILURE_EMAIL_SUBJECT || 'Failed to import queries',
  IMPORT_FAILURE_EMAIL_BODY: process.env.IMPORT_FAILURE_EMAIL_BODY || fs.readFileSync(path.join(__dirname, '../templates/failedImportBody.pug')),
  ALLOWED_ORIGINS: ['http://localhost:8888'],
  SAML: {
    SERVICE_PROVIDER: {
      ENTITY_ID: 'http://localhost:3000/api/1.0/metadata.xml',
      ASSERT_ENDPOINT: 'http://localhost:3000/api/1.0/saml/assert',
      PRIVATE_KEY: path.join(__dirname, '../test/key-file.pem'),
      CERTIFICATE: path.join(__dirname, '../test/cert-file.crt')
    },
    IDENTITY_PROVIDER: {
      SSO_LOGIN_URL: 'http://JINANW:7000/saml/sso',
      CERTIFICATE: path.join(__dirname, '../test/cert-file.crt')
    }
  }
}
