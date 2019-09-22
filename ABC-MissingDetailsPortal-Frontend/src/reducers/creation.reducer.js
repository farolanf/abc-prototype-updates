import * as types from '../constants/actionTypes';

/**
 * dashboard reducer
 */

const defaultState = {
  importedQueries: [],
  importError: null,
  uploadProgress: -1
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case types.IMPORT_QUERIES_DONE:
      return {
        ...defaultState,
        importedQueries: action.data
      }
    case types.IMPORT_QUERIES_FAILED:
      return {
        ...state,
        importError: action.data
      }
    case types.IMPORT_QUERIES_START: 
      return {
        ...state,
        uploadProgress: 0,
        importError: null,
        importedQueries: []
      }
    case types.IMPORT_QUERIES_CANCEL:
      return {
        ...defaultState
      }
    case types.IMPORT_QUERIES_PROGRESS:
      return {
        ...state,
        uploadProgress: action.data
      }
    default:
      return state;
  }
};