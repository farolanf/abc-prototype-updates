import { map } from 'lodash';
import * as types from '../constants/actionTypes';
import DataSvc from '../services/data.svc';
import utils from '../utils';

export function getStatistics(){
  return (dispatch)=>{
    return DataSvc.getStatistics().then(resp=>{
      return resp.json().then(result=>{
        if(resp.ok){
          dispatch({type: types.LOAD_STATISTICS_DONE, data: result});
        }
      });
    });
  }
}

export function getQueries(status, params){
  return (dispatch)=>{
    return DataSvc.getQueries(params).then(resp=>{
      return resp.json().then(result=>{
        if(resp.ok){
          result.results = map(result.results, utils.queryProcessor);
          dispatch({type: types.LOAD_QUERIES_DONE, data:{status, dataset: result}});
        }
      });
    });
  }
}

export function getQuery(id){
  return (dispatch)=>{
    return DataSvc.getQuery(id).then(resp=>{
      return resp.json().then(result=>{
        if(resp.ok){
          dispatch({type: types.LOAD_QUERY_DONE, data: utils.queryProcessor(result)});
        }
        return resp;
      });
    });
  }
}

export function watchQuery(id){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.watchQuery(id).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Watch Query Successfully');
        DataSvc.getQuery(id).then(resp=>{
          return resp.json().then(result=>{
            if(resp.ok){
              dispatch({type: types.LOAD_QUERY_DONE, data: utils.queryProcessor(result)});
            }
          });
        });
      }else{
        resp.json().then(result=>{
          utils.showMessage(dispatch, 'Watch Query Failed: ' + result.message, true);
        });
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Watch Query Failed', true);
    });
  }
}

export function unwatchQuery(id){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.unwatchQuery(id).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Unwatch Query Successfully');
        DataSvc.getQuery(id).then(resp=>{
          return resp.json().then(result=>{
            if(resp.ok){
              dispatch({type: types.LOAD_QUERY_DONE, data: utils.queryProcessor(result)});
            }
          });
        });
      }else{
        resp.json().then(result=>{
          utils.showMessage(dispatch, 'Unwatch Query Failed: ' + result.message, true);
        });
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Unwatch Query Failed', true);
    });
  }
}

export function reassignQueries(queryIds, userId){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.reassignQueries(queryIds, userId).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Reassign SDM Successfully');
      }else{
        resp.json().then(result=>{
          utils.showMessage(dispatch, 'Reassign SDM Failed: ' + result.message, true);
        });
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Reassign SDM Failed', true);
    });
  }
}

export function sendEmail(queryIds, userId){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.sendEmail(queryIds, userId).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Send Email Successfully');
      }else{
        resp.json().then(result=>{
          utils.showMessage(dispatch, 'Send Email Failed: ' + result.message, true);
        });
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Send Email Failed', true);
    });
  }
}

export function saveSendEmailDraft(emailProps, userId){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.saveSendEmailDraft(emailProps, userId).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Send Email Draft Saved Successfully');
      }else{
        resp.json().then(result=>{
          utils.showMessage(dispatch, 'Send Email Draft Save Failed: ' + result.message, true);
        });
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Send Email Draft Save Failed', true);
    });
  }
}

export function updateWatchers(queryId, userIds){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.updateWatchers(queryId, userIds).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Add Watcher Successfully');
        return DataSvc.getQueries({queryIds: queryId, perPage: 100}).then(resp=>{
          return resp.json().then(result=>{
            if(resp.ok){
              result.results = map(result.results, utils.queryProcessor);
              dispatch({type: types.UPDATE_QUERIES_DONE, data: result.results});
            }
            return resp;
          });
        });
      }else{
        utils.showMessage(dispatch, 'Add Watcher Failed', true);
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Add Watcher Failed', true);
    });
  } 
}

export function createComment(entity){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.createComment(entity).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Update Queries Successfully');
        DataSvc.getQueries({queryIds: entity.queryIds.join(','), perPage: 100}).then(resp=>{
          return resp.json().then(result=>{
            if(resp.ok){
              result.results = map(result.results,  utils.queryProcessor);
              dispatch({type: types.UPDATE_QUERIES_DONE, data: result.results});
            }
            return resp;
          });
        });
      }else{
        utils.showMessage(dispatch, 'Update Queries Failed', true);
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Update Queries Failed', true);
    });
  } 
}

export function changeRequestor(queryId, userId){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.patchQuery(queryId, {requestorId: userId}).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Change Requestor Successfully');
      }else{
        utils.showMessage(dispatch, 'Change Requestor Failed', true);
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Change Requestor Failed', true);
    });
  }
}