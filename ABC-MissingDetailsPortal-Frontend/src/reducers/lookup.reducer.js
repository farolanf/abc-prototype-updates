import * as types from '../constants/actionTypes';
import * as roles from '../constants/roleTypes';
import * as statuses from '../constants/statusTypes';
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