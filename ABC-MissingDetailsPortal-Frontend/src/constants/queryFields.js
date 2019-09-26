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
    id: "status"
  },
  {
    label: "Type",
    id: "queryType"
  },
  {
    label: "Sub Type",
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
    label: "Account Type",
    id: "accountType"
  },
  {
    label: "AMP ID",
    id: "ampId"
  },
  {
    label: "Billing Index",
    id: "billingIndex"
  },
  {
    label: "Billing Start Date",
    id: "billingStartDate",
    type: 'date'
  },
  {
    label: "Billing End Date",
    id: "billingEndDate",
    type: 'date'
  },
  {
    label: "Value to be billed",
    id: "valueToBeBilled"
  },
  {
    label: "Passive Approval",
    id: "passiveApproval"
  },
  {
    label: "Currency",
    id: "currencyName"
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
    label: "Date & Time Opened",
    id: "openedDate",
    type: 'datetime'
  },
  {
    label: "Date & Time Closed",
    id: "closedDate",
    type: 'datetime'
  },
  {
    label: "Missing Info owner",
    id: "missingInfoOwner",
    format: 'link'
  },
  {
    label: "Rework",
    id: "reworkStr"
  },
  {
    label: "Rework Reason",
    id: "reworkReason"
  },
  {
    label: "dMPS/pMPS",
    id: "dmpsPmps"
  },
  {
    label: "Requestor",
    id: "requestorName",
    format: "link"
  },
  {
    label: "Missing Info Action Owner",
    id: "missingInfoActionOwner",
    format: 'link',
    editableBy: [roles.DELIVERY_USER]
  },
  {
    label: "Watcher",
    id: "watchers",
    format: "link",
    type: 'array'
  }
];