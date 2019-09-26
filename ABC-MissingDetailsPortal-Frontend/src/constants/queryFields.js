import * as roles from './roleTypes'

export const columns = [
  {
    label: "Query ID",
    id: "id"
  },
  {
    label: "Status",
    id: "status"
  },
  {
    label: "Escalation",
    id: "escalation",
    type: "escalation"
  },
  {
    label: "Query Type",
    id: "queryType"
  },
  {
    label: "Query Sub-type",
    id: "querySubType"
  },
  {
    label: "Country",
    id: "countryName"
  },
  {
    label: "Account",
    id: "accountName"
  },
  {
    label: "AMP ID",
    id: "ampId"
  },
  {
    label: "SAP Contract No",
    id: "sapContract"
  },
  {
    label: "Due Date",
    id: "dueDate",
    type: 'date'
  },
  {
    label: "Revised Due Date",
    id: "reviseDate",
    type: 'date'
  },
  {
    label: "Watcher",
    id: "watchers",
    format: "link",
    type: 'array'
  },
  {
    label: "Date & Time Opened",
    id: "openedDate",
    type: 'datetime'    
  },
  {
    label: "Ageing",
    id: "aging"
  },
  {
    label: "SDM",
    id: "sdmName",
    format: "link"
  },
  {
    label: "Rework",
    id: "reworkStr"
  },
  {
    label: "dMPS/pMPS",
    id: "dmpsPmps"
  },
  {
    label: "Comments",
    id: "comment"
  },
  {
    label: "Attachments",
    id: "attachments",
    type: 'array',
    format: "link"
  },
  {
    label: "Billing Index",
    id: "billingIndex",
    isDetails: true
  },
  {
    label: "Billing Start Date",
    id: "billingStartDate",
    type: 'date',
    isDetails: true
  },
  {
    label: "Billing End Date",
    id: "billingEndDate",
    type: 'date',
    isDetails: true  
  },
  {
    label: "Value to be billed",
    id: "valueToBeBilled",
    isDetails: true  
  },
  {
    label: "Currency",
    id: "currencyName",
    isDetails: true  
  },
  {
    label: "Date & Time Closed",
    id: "closedDate",
    type: 'datetime',
    isDetails: true
  }
];

export const fields = [
  {
    label: "Query ID",
    id: "queryId"
  },
  {
    label: "Status",
    id: "status",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Type",
    id: "queryType",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Sub Type",
    id: "querySubType",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Country",
    id: "countryName",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Account",
    id: "accountName",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Account Type",
    id: "accountType",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "AMP ID",
    id: "ampId",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Billing Index",
    id: "billingIndex",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Billing Start Date",
    id: "billingStartDate",
    type: 'date',
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Billing End Date",
    id: "billingEndDate",
    type: 'date',
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Value to be billed",
    id: "valueToBeBilled",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Passive Approval",
    id: "passiveApproval",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Currency",
    id: "currencyName",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Due Date",
    id: "dueDate",
    type: 'date',
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Revised Due Date",
    id: "reviseDate",
    type: 'date',
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Date & Time Opened",
    id: "openedDate",
    type: 'datetime',
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Date & Time Closed",
    id: "closedDate",
    type: 'datetime',
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Missing Info owner",
    id: "missingInfoOwner",
    format: 'link',
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Rework",
    id: "reworkStr",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Rework Reason",
    id: "reworkReason",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "dMPS/pMPS",
    id: "dmpsPmps",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Requestor",
    id: "requestorName",
    format: "link",
    editableBy: [roles.CONTRACT_ADMIN_USER]
  },
  {
    label: "Missing Info Action Owner",
    id: "missingInfoActionOwner",
    format: 'link',
    editableBy: [roles.CONTRACT_ADMIN_USER, roles.DELIVERY_USER]
  },
  {
    label: "Watcher",
    id: "watchers",
    format: "link",
    type: 'array'
  }
];