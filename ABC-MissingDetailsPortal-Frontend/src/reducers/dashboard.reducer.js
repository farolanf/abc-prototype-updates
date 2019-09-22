import {forEach, find, assign} from 'lodash';
import * as types from '../constants/actionTypes';
import * as statuses from '../constants/queryStatusTypes';

function updateQuery(state, query){
  const {allQueries, newQueries, openQueries, closedQueries, rejectedQueries} = state;
  forEach([allQueries.results, newQueries.results, openQueries.results, closedQueries.results, rejectedQueries.results], list=>{
    const found = find(list, ['id', query.id]);
    if(found){
      assign(found, query);
    }
  });
}

/**
 * dashboard reducer
 */

const defaultState = {
  statistics: {},
  allQueries: {
    page: 1,
    perPage: 10,
    total: 0,
    results: []
  },
  newQueries: {
    page: 1,
    perPage: 10,
    total: 0,
    results: []
  },
  openQueries: {
    page: 1,
    perPage: 10,
    total: 0,
    results: []
  },
  closedQueries: {
    page: 1,
    perPage: 10,
    total: 0,
    results: []
  },
  rejectedQueries: {
    page: 1,
    perPage: 10,
    total: 0,
    results: []
  }
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case types.LOAD_STATISTICS_DONE:
      return {
        ...state,
        statistics: action.data
      }
    case types.LOAD_QUERIES_DONE:
      const newState = {
        ...state
      }
      switch(action.data.status){
        case statuses.NEW:
          newState.newQueries = action.data.dataset;
          break;
        case statuses.OPEN:
          newState.openQueries = action.data.dataset;
          break;
        case statuses.CLOSED:
          newState.closedQueries = action.data.dataset;
          break;
        case statuses.REJECTED:
          newState.rejectedQueries = action.data.dataset;
          break;
        case 'all':
          newState.allQueries = action.data.dataset;
          break;
        default: break;
      }
      return newState;
    case types.LOAD_QUERY_DONE:
      updateQuery(state, action.data);
      return {
        ...state,
        allQueries: {
          ...state.allQueries
        },
        newQueries: {
          ...state.newQueries
        },
        openQueries: {
          ...state.openQueries
        },
        closedQueries: {
          ...state.closedQueries
        },
        rejectedQueries: {
          ...state.rejectedQueries
        }
      };
    case types.UPDATE_QUERIES_DONE:
      forEach(action.data, query=>{
        updateQuery(state, query);
      });
      return {
        ...state,
        allQueries: {
          ...state.allQueries
        },
        newQueries: {
          ...state.newQueries
        },
        openQueries: {
          ...state.openQueries
        },
        closedQueries: {
          ...state.closedQueries
        },
        rejectedQueries: {
          ...state.rejectedQueries
        }
      };
    default:
      return state;
  }
};