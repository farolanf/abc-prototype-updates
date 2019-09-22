import { find, forEach, assign} from 'lodash';
import * as types from '../constants/actionTypes';
import * as roles from '../constants/roleTypes';

/**
 * users reducer
 */

const defaultState = {
  allUsers: {
    results: []
  },
  deliveryUsers: {
    results: []
  },
  manageUsers: {
    results: []
  },
  adminUsers:{
    results: []
  }
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case types.LOAD_USERS_DONE:
      const newState = {
        ...state
      }
      switch(action.data.role){
        case roles.DELIVERY_USER:
          newState.deliveryUsers = action.data.dataset;
          break;
        case roles.MANAGEMENT_USER:
          newState.manageUsers = action.data.dataset;
          break;
        case roles.CONTRACT_ADMIN_USER:
          newState.adminUsers = action.data.dataset;
          break;
        case 'all':
          newState.allUsers = action.data.dataset;
          break;
        default:
          break;
      }
      return newState;
    case types.UPDATE_USER_DONE:
      const {allUsers, deliveryUsers, manageUsers, adminUsers} = state;
      forEach([allUsers.results, deliveryUsers.results, manageUsers.results, adminUsers.results], list=>{
        const found = find(list, ['id', action.data.id]);
        if(found){
          assign(found, action.data);
        }
      });
      return {
        allUsers: {
          ...allUsers
        },
        deliveryUsers: {
          ...deliveryUsers
        },
        manageUsers: {
          ...manageUsers
        },
        adminUsers: {
          ...adminUsers
        }
      };
    default:
      return state;
  }
};