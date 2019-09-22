import { has, map, unset} from 'lodash';
import * as types from '../constants/actionTypes';
import DataSvc from '../services/data.svc';
import utils from '../utils';

export function getEmailSettings(){
  return (dispatch)=>{
    return DataSvc.getEmailSettings().then(resp=>{
      return resp.json().then(result=>{
        if(resp.ok){
          if(has(result, 'deliveryAndManagementUserEmailSettings.exceptionTypes')){
            result.deliveryAndManagementUserEmailSettings.exceptionTypeIds = map(result.deliveryAndManagementUserEmailSettings.exceptionTypes, 'id');
            unset(result, 'deliveryAndManagementUserEmailSettings.exceptionTypes');
          }
          dispatch({type: types.LOAD_EMAIL_SETTINGS_DONE, data: result});
        }
        return resp;
      })
    })
  }
}

export function updateSettings(path, value){
  return {type: types.UPDATE_SETTINGS, data: {path, value}}
}

export function getSlaSettings(){
  return (dispatch)=>{
    return DataSvc.getSlaSettings().then(resp=>{
      return resp.json().then(result=>{
        if(resp.ok){
          dispatch({type: types.LOAD_SLA_SETTINGS_DONE, data: result});
        }
        return resp;
      })
    })
  }
}

export function saveEmailSettings(entity){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.saveEmailSettings(entity).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Saved Successfully');
      }else{
        utils.showMessage(dispatch, 'Save Failed', true);
      }
      return resp;
    }).catch(e=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Save Failed', true);
    })
  }
}

export function saveSlaSettings(entity){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.saveSlaSettings(entity).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'Saved Successfully');
      }else{
        utils.showMessage(dispatch, 'Save Failed', true);
      }
      return resp;
    }).catch(e=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Save Failed', true);
    })
  }
}