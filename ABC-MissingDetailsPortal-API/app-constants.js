/**
 * App constants
 */
// Application roles
const Roles = {
  DeliveryUser: 'DeliveryUser',
  ManagementUser: 'ManagementUser',
  ContractAdminUser: 'ContractAdminUser',
  SuperUser: 'SuperUser'
}

// User statuses
const UserStatuses = {
  Active: 'Active',
  Blocked: 'Blocked'
}

// Notification statuses
const NotificationStatuses = {
  New: 'New',
  Read: 'Read'
}

// Notification types
const NotificationTypes = {
  ClosedQueries: 'ClosedQueries',
  NewQueries: 'NewQueries',
  PendingQueries: 'PendingQueries',
  RejectedQueries: 'RejectedQueries'
}

// Query statuses
const QueryStatuses = {
  New: 'New',
  Open: 'Open',
  Closed: 'Closed',
  Rejected: 'Rejected'
}

// Time units
const TimeUnits = {
  Minutes: 'Minutes',
  Hours: 'Hours',
  Days: 'Days'
}

// email frequency options
const emailsFrequencies = {
  OnceADay: 'OnceADay',
  OnceAWeek: 'OnceAWeek'
}

const Priorities = {
  High: 'High',
  Low: 'Low'
}

module.exports = {
  Roles,
  UserStatuses,
  NotificationStatuses,
  NotificationTypes,
  QueryStatuses,
  TimeUnits,
  emailsFrequencies,
  Priorities
}
