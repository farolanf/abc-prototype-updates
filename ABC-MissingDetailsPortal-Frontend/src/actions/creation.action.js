import { push } from 'connected-react-router';
import * as types from '../constants/actionTypes';
import DataSvc from '../services/data.svc';
import utils from '../utils';

export function createQuery(entity){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.createQuery(entity).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        dispatch(push('/dashboard'));
        utils.showMessage(dispatch, 'Create Query Successfully');
      }else{
        resp.json().then(result=>{
          utils.showMessage(dispatch, 'Create Query Failed: ' + result.message, true);
        });
      }
      return resp;
    }).catch(()=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Create Query Failed', true);
    });
  }
}

export function importQueries(file){
  return (dispatch)=>{
    dispatch({type: types.IMPORT_QUERIES_START});
    return DataSvc.importQueries(file, event=>{
      dispatch({type: types.IMPORT_QUERIES_PROGRESS, data: (event.loaded / event.total * 100).toFixed(0)})
    }).then(resp=>{
      const result = JSON.parse(resp.responseText);
      if(resp.status >= 400){
        dispatch({type: types.IMPORT_QUERIES_FAILED, data: result.message});
      }else{
        dispatch({type: types.IMPORT_QUERIES_DONE, data: result.results.map(utils.queryProcessor)});
        dispatch(push('/fileUploadedPage'));
      }
    })
  }
}

export function cancelImport(){
  DataSvc.cancelImport();
  return {type: types.IMPORT_QUERIES_CANCEL};
}