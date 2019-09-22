import * as types from '../constants/actionTypes';

const defaultState = {
  notifications: {
    total: 0,
    list: []
  },
  loading: false,
  messages: [],
};


export default (state = defaultState, action) => {
  switch (action.type) {
    case types.LOADING_START:
      return {
        ...state,
        loading: true
      };
    case types.LOADING_END:
      return {
        ...state,
        loading: false
      }
    case types.SHOW_MESSAGE:
      return {
        ...state,
        messages: state.messages.concat(action.data)
      }
    case types.HIDE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(msg=>msg.id !== action.data.id)
      }
    case types.LOAD_NOTIFICATIONS_DONE:
      return {
        ...state,
        notifications: action.data
      }
    default:
      return state;
  }
};