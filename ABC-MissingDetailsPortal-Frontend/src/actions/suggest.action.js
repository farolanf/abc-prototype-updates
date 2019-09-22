import * as types from '../constants/actionTypes';
import DataSvc from '../services/data.svc';

export function getExceptionTypes(){
  return (dispatch)=>{
    return DataSvc.getExceptionTypes().then(resp=>{
      resp.json().then(result=>{
        if(resp.ok){
          dispatch({type: types.LOAD_EXCEPTION_TYPES_DONE, data: result.map(type=>({id: type.id, value: type.name}))});
        }
      })
    })
  }
}