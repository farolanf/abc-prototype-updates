import { push } from 'connected-react-router';
import * as types from '../constants/actionTypes';
import dataSvc from '../services/data.svc';
import DataSvc from '../services/data.svc';
import utils from '../utils';

/**
 * user authentication function
 */

export function logout() {
  return (dispatch) => {
    DataSvc.logout().then(()=>{
      dispatch(push('/'));
      dispatch({ type: types.LOGOUT_USER });
    }).catch(()=>{
      dispatch(push('/'));
      dispatch({ type: types.LOGOUT_USER });
    });
  }
}

export function getMe(redirect){
  return dispatch=>{
    dispatch({type: types.LOADING_START});
    dataSvc.getMe().then(resp=>{
      dispatch({type: types.LOADING_END});
      resp.json().then(result=>{
        if(resp.ok){
          dispatch({type: types.LOGIN_USER, data: result});
          if(redirect){
            redirectUser(dispatch);
          }
        }else if(resp.status !== 401){
          utils.showMessage(dispatch, result.message, true);          
        }
      });
    }).catch((e)=>{
      dispatch({type: types.LOADING_END});
      utils.showMessage(dispatch, 'Fetch Failed', true);
    });
  }
}

function redirectUser(dispatch){
  dispatch(push("/dashboard"));
}