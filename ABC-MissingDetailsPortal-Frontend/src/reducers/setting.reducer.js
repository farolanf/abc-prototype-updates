import { pickBy, cloneDeep, set} from 'lodash';
import * as types from '../constants/actionTypes';
import * as frequencies from '../constants/frequencyTypes';

/**
 * setting reducer
 */

const defaultState = {
  email: {
    contractUserEmailSettings:{
      emailsFrequency: frequencies.ONCE_A_DAY,
      newQueries: false,
      openQueries: false,
      closedQueries: false,
      rejectedQueries: false
    },
    deliveryAndManagementUserEmailSettings: {
      emailsFrequency: frequencies.ONCE_A_DAY,
      newQueries: false,
      openQueries: false,
      closedQueries: false,
      exceptionTypeIds: []
    }
  },
  sla: []
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case types.LOAD_EMAIL_SETTINGS_DONE:
      return {
        ...state,
        email: {
          ...defaultState.email,
          ...pickBy(action.data)
        }
      };
    case types.UPDATE_SETTINGS:
      const newState = cloneDeep(state);
      set(newState, action.data.path, action.data.value);
      return newState;
    case types.LOAD_SLA_SETTINGS_DONE: 
      return {
        ...state,
        sla: action.data.queryTypeSLAs
      }
    default:
      return state;
  }
};