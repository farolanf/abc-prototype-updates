import * as types from '../constants/actionTypes';
import * as moment from 'moment';
import DataSvc from '../services/data.svc';
import utils from '../utils';

function userProcesser(user){
  return {
    ...user,
    name: (user.firstName ? user.firstName : '') + ' ' + (user.lastName ? user.lastName : ''),
    createdOn: moment(user.createdOn).format('MM/DD/YYYY')
  }
}

export function getUsers(role, params){
  return (dispatch)=>{
    return DataSvc.getUsers(params).then(resp=>{
      resp.json().then(result=>{
        if(resp.ok){
          result.results = result.results.map(userProcesser)
          dispatch({type: types.LOAD_USERS_DONE, data: {role, dataset: result}});
        }
      })
    })
  }
}

export function patchUser(id, entity){
  return (dispatch)=>{
    return DataSvc.patchUser(id, entity).then(resp=>{
      resp.json().then(result=>{
        if(resp.ok){
          dispatch({type: types.UPDATE_USER_DONE, data: userProcesser(result)});
        }
      });
      return resp;
    })
  }
}

export function createUser(entity){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.createUser(entity).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'User Created Successfully');
      }else{
        resp.json().then(result=>{
          utils.showMessage(dispatch, 'Create User Failed: ' + result.message, true);
        });
      }
      return resp;
    }).catch(e=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Create User Failed', true);
    });
  }
}

export function removeUser(id){
  return (dispatch)=>{
    dispatch({type: types.LOADING_START});
    return DataSvc.removeUser(id).then(resp=>{
      dispatch({type: types.LOADING_END});
      if(resp.ok){
        utils.showMessage(dispatch, 'User Removed Successfully');
      }else{
        utils.showMessage(dispatch, 'Remove User Failed', true);
      }
      return resp;
    }).catch(e=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Remove User Failed', true);
    });
  }
}