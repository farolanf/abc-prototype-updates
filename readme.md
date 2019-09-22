You can follow the steps below to get the app running quickly.

# ABC-MissingDetailsPortal-API
1. Run `npm install`
2. Run `npm run mock-sso`, the last line of the output will look like this:
```=> http://macbook.local:7000```
3. Open `config/default.js`, go to the last of the file, replace the domain part in field `SSO_LOGIN_URL`, so that
```SSO_LOGIN_URL: 'http://cp:7000/saml/sso',```
becomes
```SSO_LOGIN_URL: 'http://macbook.local:7000/saml/sso',```
4. Run `npm start`, now api is working

# ABC-MissingDetailsPortal-Frontend
1. Run `npm install` and then `num run dev`
2. Visit http://localhost:8888 in your browser, click Sign In button on the page
3. On the next page, all that matters is what you put into the Subject NameID field, which decides which user role is logged in:
3.1. super@test.com - super user
3.2. delivery@test.com - delivery (SDM) user role
3.3. contract-admin@test.com - contract admin user role
3.4. management@test.com - management user role