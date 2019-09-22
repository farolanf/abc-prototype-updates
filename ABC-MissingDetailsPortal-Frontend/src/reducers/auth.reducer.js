import * as types from '../constants/actionTypes';

/* auth reducer */
const defaultState = {
  user: {},
  auth: null,
};


export default (state = defaultState, action) => {
  switch (action.type) {
    case types.LOGIN_USER:
      return {
        ...state,
        user: action.data,
        loginFailed: false
      };
    case types.LOGOUT_USER:
      return {
        ...state,
        user: null
      };
    default:
      return state;
  }
};