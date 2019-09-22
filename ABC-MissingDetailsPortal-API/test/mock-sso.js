const {runServer} = require('saml-idp')
const fs = require('fs')
const path = require('path')

runServer({
  acsUrl: '',
  audience: 'http://localhost:5000/metadata.xml',
  sloUrl: 'http://localhost:5000/saml/logout',
  key: fs.readFileSync(path.join(__dirname, 'key-file.pem')).toString(),
  cert: fs.readFileSync(path.join(__dirname, 'cert-file.crt')).toString(),
  encryptAssertion: true,
  encryptionCert: fs.readFileSync(path.join(__dirname, 'cert-file.crt')).toString(),
  encryptionPublicKey: fs.readFileSync(path.join(__dirname, 'pub.pem')).toString(),
  config: {
    metadata: [{
      id: 'employeeId',
      optional: true,
      displayName: 'Employee ID',
      description: 'Employee id of user',
      multiValue: false
    }, {
      id: 'firstName',
      optional: false,
      displayName: 'First Name',
      description: 'The given name of the user',
      multiValue: false
    }, {
      id: 'lastName',
      optional: false,
      displayName: 'Last Name',
      description: 'The surname of the user',
      multiValue: false
    }],
    user: {
      userName: 'delivery@test.com',
      firstName: 'sso first',
      lastName: 'sso last'
    }
  }
})
