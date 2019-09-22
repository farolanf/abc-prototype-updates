import * as moment from 'moment';
import * as types from '../constants/actionTypes';
import dataSvc from '../services/data.svc';

function notificationProcessor(result){
  return {
    total: result.total,
    list: result.results.map(item=>({
      id: item.id,
      type: item.status,
      timestamp: moment(item.createdOn).fromNow(true),
      message: item.text,
      queryId: item.relatedModelId
    }))
  };
}

export function getNotifications(){
  return (dispatch) => {
    dataSvc.getNotifications()
      .then(resp=>{
        resp.json().then(result=>{
          if(resp.ok){
            dispatch({type: types.LOAD_NOTIFICATIONS_DONE, data: notificationProcessor(result)});
          }
        });
      });
  }
}
