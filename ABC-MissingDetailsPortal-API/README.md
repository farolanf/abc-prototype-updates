# ABC - Missing Details Portal REST API

## Requirements

- Node JS 8
- Microsoft SQL Server 2012+
- SMTP server

## Configuration

The app configuration can be changed in `config/default.js` or by setting environment variables.
The following variables can be configured.

- `LOG_LEVEL` the logging level, `error` or `debug`
- `PORT` the port on that app listens
- `API_PREFIX` the REST API path prefix
- `DB_URL` the database connection URL, it will be encrypted/decrypted with DB_URL_ENCRYPTION_KEY,
  if the configured DB URL is encrypted string, it will be decrypted;
  if it is plain connection string, then it will be replaced with encypted string when app starts
- `APP_BASE_URL` the base URL of the app, used to construct uploaded file URL
- `SESSION_SECRET` the session secret, whwen this is configured, it will be encrypted and moved to ENCRYPTED_SESSION_SECRET
- `ENCRYPTED_SESSION_SECRET` the encrypted session secret
- `COOKIE_MAX_AGE` the cookie max age
- `PREVENT_XSRF` whether to prevent XSRF attack, 'true' or 'false'
- `DB_URL_ENCRYPTION_KEY` the DB URL encryption key
- `ENCRYPTION_KEY` the encryption key used to encrypt/decrypt entities fields and session secret
- `TOKEN_EXPIRATION` the token expiration period string
- `FROM_EMAIL` the from email, used to send emails
- `EMAIL` the email SMTP config
- `DEFAULT_DUE_DATE_PERIOD` the default due date period
- `DEFAULT_PAGE_INDEX` the default search page index, 1 based
- `DEFAULT_PER_PAGE` the default search page size
- `ENCRYPTED_QUERY_FIELDS` the encrypted query fields
- `ENCRYPTED_USER_FIELDS` the encrypted user fields
- `ENCRYPTED_SDMCOMMENT_FIELDS` the encrypted SDM comment fields
- `FREQUENCIES` the schedule config for frequencies
- `UNUSED_FILES_CLEANER_JOB_SCHEDULE` the unused files cleaner job schedule
- `FILE_RETAINING_PERIOD` the file retaining period
- `QUERY_DATA_EMAIL_SUBJECT` the query data email subject
- `QUERY_DATA_EMAIL_BODY` the query data email body
- `IMPORT_FAILURE_EMAIL_SUBJECT` the import failure email subject
- `IMPORT_FAILURE_EMAIL_BODY` the import failure email body
- `ALLOWED_ORIGINS` allowed origins to access this api
- `SAML.SERVICE_PROVIDER.ENTITY_ID`: unique identifier for the saml service provider, default to the URL of the metadata file
- `SAML.SERVICE_PROVIDER.ASSERT_ENDPOINT`: URL of saml service provider assert endpoint
- `SAML.SERVICE_PROVIDER.PRIVATE_KEY`: Private key for the saml service provider
- `SAML.SERVICE_PROVIDER.CERTIFICATE`: Certificate for the saml service provider
- `SAML.IDENTITY_PROVIDER.SSO_LOGIN_URL`: Saml provider login url to use during a login request
- `SAML.IDENTITY_PROVIDER.CERTIFICATE`: Certificate for the saml identity provider


Note that cookie sescure is enabled when NODE_ENV environment variable is 'production', this
will require HTTPS to be used.


## DB Setup

- Connect to your DB server using a client (e.g. MS SQL Server Management Studio)
- Create a new database
- Configure DB_URL to point to the new database in `config/default.js` or via environment variable


## SMTP server setup

You may use a mock SMTP server to simplify tests. And fakeSMTP (http://nilhcem.com/FakeSMTP/) can be used.
Download the `fakeSMTP-2.0.jar` from the website, then run `java -jar fakeSMTP-2.0.jar -m` to start mock SMTP server.
When the GUI is shown, cilck the `Start Server` to start the mock SMTP server.
Update email.port config to match the Fake SMTP server port. And fakeSMTP can accept any username/password.


## Local Deployment

- Install dependencies `npm install`
- Run lint `npm run lint`
- Run lint fix `npm run lint:fix`
- Clear and create tables `npm run init-db`
- Insert lookup data `npm run lookup-data`
- Insert test data `npm run test-data`
- Use another terminal to start mock SSO server `npm run mock-sso`
- Update the `SAML.IDENTITY_PROVIDER.SSO_LOGIN_URL` config to match your environment
- You can generate new certification file and update it as you please
- Start app `npm start`


## Verification
- Please use standalone Postman (https://www.getpostman.com/), not Postman of Chrome extension, the latter doesn't
  directly support cookies
- Import Postman collection and environment in the docs folder to Postman
- Call the `security / login XXX` APIs to login with various roles
- Call other APIs
- For testing the import queries API, you may use `test/import_success.zip` and `test/import_failure.zip` for success/failure tests
- To test the email sending jobs, run the `settings / Save email settings` test, wait for more then 1 minute,
  then watch REST app console, it should say running the jobs, also check the fake SMTP server UI, it should show new emails
- To test the file cleaning job, add a file in postman, do not link it to any other entity, check the file in public/upload, it should be
  uploaded there, wait for more than 2 minutes, see the REST app console, it should say running the file cleaner job, and says removing some file,
  then check the public/upload folder, the file should be deleted in local storage

## Test User
- Delivery user: delivery@test.com
- Management User: management@test.com
- Contract Admin User: contract-admin@test.com
- Super User: super@test.com

## Notes

- uploaded file is put to public/upload folder, the public folder is exposed as public content, so that the uploaded files can be accessed publicly
- we need to support in-transit and at-rest encryption.
  As I see, only Query/User/SMDComment data may contain sensitive data.
  For in-transit encryption, the data are encrypted/decrypted in front end side, when comes to back end, we just persist them like normal string,
  and some Query/User/SDMComment fields have been changed to longer to store them, API input validation is loosen to allow long encrypted strings to pass.
  For at-rest encryption, we can configure fields of Query/User/SDMComment to encrypt/decrypt, these configured fields will be encrypted
  before saving to db, and decrypted after retrieving from db.
- after a file is created, it is not linking to any object, to avoid being deleted by the file cleaner job, FILE_RETAINING_PERIOD
  config param is introduced, file created less than this period won't be deleted by the file cleaner job
- Content security policy headers are set in app.js, at present only same domain content is allowed,
  in production we may add to add more content to whitelist, see https://helmetjs.github.io/docs/csp/
- To prevent XSRF attack (https://en.wikipedia.org/wiki/Cross-site_request_forgery), a simple Cookie-to-header token approach
  (see https://en.wikipedia.org/wiki/Cross-site_request_forgery `Cookie-to-header token` section) is used,
  this is enabled if PREVENT_XSRF is true.
  When config param PREVENT_XSRF is true, during login an xsrf-token cookie is set, client side should read this token from cookie,
  and pass it as `xsrf-token` header for every request
