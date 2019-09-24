import * as moment from 'moment';
import {get} from 'lodash';
import {DATE_FORMAT, DATETIME_FORMAT} from '../config';
import * as types from '../constants/actionTypes';

function querySortMap(id){
  switch(id){
    case 'queryType':
      return 'exceptionTypeId';
    case 'querySubType':
      return 'exceptionSubType';
    case 'countryName':
      return 'countryId';
    case 'aging':
      return 'openedDate';
    case 'sdmName':
      return 'sdmId';
    case 'reworkStr':
      return 'rework';
    default:
      return id;
  }
}

function formatField(query, field){
  if(field.type === 'date'){
    return query[field.id] ? moment(query[field.id]).format(DATE_FORMAT) : 'N/A';
  }else if(field.type === 'datetime'){
    return query[field.id] ? moment(query[field.id]).format(DATETIME_FORMAT) : 'N/A';
  }else{
    return query[field.id];
  }
}

function queryProcessor(query){
  return {
    ...query,
    queryId: query.id,
    countryName: get(query, 'country.name'),
    queryType: get(query, 'exceptionType.name'),
    querySubType: query.exceptionSubType,
    sdmName: get(query, 'sdm.firstName', '') + ' ' + get(query, 'sdm.lastName', ''),
    reworkStr: query.rework ? 'Yes' : 'No',
    currencyName: get(query, 'currency.name'),
    requestorName: get(query, 'requestor.firstName', '') + ' ' + get(query, 'requestor.lastName', '')
  }
}

let messageId = 0;
function showMessage(dispatch, text, error){
  const id = messageId++;
  dispatch({type: types.SHOW_MESSAGE, data: {text, error, id}});
  setTimeout(()=>{
    dispatch({type: types.HIDE_MESSAGE, data: {id}});
  }, 3000);
}

function showMessageBox(dispatch, title, text, error){
  const id = messageId++;
  dispatch({type: types.SHOW_MESSAGE, data: {title, text, error, id, messageBox: true}});
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@mps\.com$/;
  return re.test(String(email).toLowerCase());
}

export default {
  querySortMap,
  formatField,
  queryProcessor,
  showMessage,
  showMessageBox,
  validateEmail
}
