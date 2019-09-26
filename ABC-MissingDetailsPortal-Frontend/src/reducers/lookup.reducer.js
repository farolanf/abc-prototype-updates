import * as types from '../constants/actionTypes';
import * as roles from '../constants/roleTypes';
import * as statuses from '../constants/statusTypes';
import * as queryStatuses from '../constants/queryStatusTypes';
import * as frequencies from '../constants/frequencyTypes';
import * as units from '../constants/timeUnitTypes';

/**
 * dashboard reducer
 */

const defaultState = {
  countries: [],
  currencies: [],
  slaDuration: [{
    id: 1,
    value: units.MINUTES
  }, {
    id: 2,
    value: units.HOURS
  }, {
    id: 3,
    value: units.DAYS
  }],
  rejectReason: [{
    id: 1,
    value: 'Incomplete details'
  }, {
    id: 2, 
    value: 'Duplicate query'
  }],
  roleOpts: [
    {
      id: 1,
      value: roles.DELIVERY_USER
    },{
      id: 2, 
      value: roles.MANAGEMENT_USER
    },{
      id: 3,
      value: roles.CONTRACT_ADMIN_USER
    },{
      id: 4,
      value: roles.SUPER_USER
    }
  ],
  statusOpts: [
    {
      id: 1,
      value: statuses.ACTIVE
    },{
      id: 2,
      value: statuses.BLOCKED
    }
  ],
  queryStatusOpts: [
    {
      id: 1,
      value: queryStatuses.NEW
    },
    {
      id: 2,
      value: queryStatuses.OPEN
    },
    {
      id: 3,
      value: queryStatuses.CLOSED
    },
    {
      id: 4,
      value: queryStatuses.REJECTED
    }
  ],
  emailFreqOpts: [
    {
      id: 1,
      value: frequencies.ONCE_A_DAY
    },
    {
      id: 2,
      value: frequencies.ONCE_A_WEEK
    }
  ],
  typeOpts: [
    { id: 1, value: 'IBR approval' },
    { id: 2, value: 'Option 2' },
  ],
  subTypeOpts: [
    { id: 1, value: 'Passive' },
    { id: 2, value: 'Option 2' },
  ],
  countryOpts: [
    { id: 1, value: 'USA' },
    { id: 2, value: 'Other' },
  ],
  accountTypeOpts: [
    { id: 1, value: 'Value' },
    { id: 2, value: 'Option 2' },
  ],
  currencyOpts: [
    { id: 1, value: 'US Dollar' },
    { id: 2, value: 'Other' },
  ],
  dmpsOpts: [
    { id: 1, value: 'dMPS' },
    { id: 2, value: 'pMPS' },
  ],
  teamNameOpts: [
    { id: 1, value: 'Team 1' },
    { id: 2, value: 'Team 2' },
  ],
  exceptionTypes: []
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case types.LOAD_EXCEPTION_TYPES_DONE:
      return {
        ...state,
        exceptionTypes: action.data
      }
    case types.LOAD_COUNTRIES_DONE:
      return {
        ...state,
        countries: action.data
      }
    case types.LOAD_CURRENCIES_DONE:
      return {
        ...state,
        currencies: action.data
      }
    default:
      return state;
  }
};