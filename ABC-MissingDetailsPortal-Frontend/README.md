# abc-mps

## Prerequisites
  - node 6.13+
  
## Running the submission
To run the submission run the following command: 
```
$ cd ~/Submission
$ npm install
$ npm run dev
```

## Linting the submission
To lint the submission run
```
npm run lint
```
If it successfully passes no error is displayed ortherwise it shows the error

## Hosted url
The application is hoseted on `http://localhost:8888/`

## Configuration

The app configuration can be changed in `src/config/index.js`.
- API_BASE: REST API base url
- DATE_FORMAT: moment format string for Date type
- DATETIME_FORMAT: moment format string for DateTime type
- REFRESH_NOTIFICATION_INTERVAL: time interval to retrieve notifications in milliseconds
- BULK_QUERIES_TEMPLATE_URL: template file url for bulk queries uploading

## User authentication
The application allows login using four user roles. Adding username or password otherther what's mentioned here gives validation error.

Test Users:
- Delivery user: delivery@test.com
- Management User: management@test.com
- Contract Admin User: contract-admin@test.com
- Super User: super@test.com
