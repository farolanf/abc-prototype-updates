import {stringify} from 'query-string';
import {pickBy, unset} from 'lodash';
import {saveAs} from 'file-saver';
import {API_BASE} from '../config';

function constructHeaders(){
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  return headers;
}

function fetchWithBody(method, url, body){
  const headers = constructHeaders();
  const options = {
    method,
    headers,
    credentials: 'include'
  }

  if(body){
    options.body = JSON.stringify(pickBy(body, v=>v===false||!!v));
  }

  return fetch(API_BASE + url, options).then(resp=>{
    authGuard(resp);
    return resp;
  });
}

function post(url, body){
  return fetchWithBody('POST', url, body);
}

function patch(url, body){
  return fetchWithBody('PATCH', url, body);
}

function del(url, body){
  return fetchWithBody('DELETE', url, body);
}

function put(url, body){
  return fetchWithBody('PUT', url, body);
}

function get(url, params){
  const headers = constructHeaders();

  return fetch(API_BASE + url + (params ? '?' + stringify(pickBy(params, v=>v===false||!!v)) : ''), {
    method: 'GET',
    headers,
    credentials: 'include'
  }).then(resp=>{
    authGuard(resp);
    return resp;
  });
}

//data service

function getNotifications(){
  return get('/notifications', {status: 'New', perPage: 100});
}

function logout(){
  return post('/logout');
}

function getStatistics(){
  return get('/globalStatistics');
}

function getUsers(params){
  return get('/users', params);
}

function createUser(entity){
  return post('/users', entity);
}

function patchUser(id, entity){
  return patch(`/users/${id}`, entity);
}

function removeUser(id){
  return del(`/users/${id}`);
}

function getEmailSettings(){
  return get('/emailSettings');
}

function getExceptionTypes(){
  return get('/exceptionTypes');
}

function saveEmailSettings(entity){
  return put('/emailSettings', entity);
}

function getSlaSettings(){
  return get('/slaSettings');
}

function saveSlaSettings(entity){
  return put('/slaSettings', entity);
}

function getQueries(params){
  return get('/queries', params);
}

function getCountries(){
  return get('/countries');
}

function getCurrencies(){
  return get('/currencies');
}

function watchQuery(id){
  return put(`/queries/${id}/watch`);
}

function unwatchQuery(id){
  return put(`/queries/${id}/unwatch`);
}

function getQuery(id){
  return get(`/queries/${id}`);
}

function exportQueries(params){
  return fetch(API_BASE + '/queries' + (params ? '?' + stringify(pickBy(params)) : ''), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/xls'
    }
  }).then(resp=>{
    if(resp.ok){
      resp.blob().then(data=>{
        saveAs(data, 'queries.xlsx');
      });
    }
  });
}

function reassignQueries(queryIds, userId){
  return patch('/reassignQueries', {queryIds, userId});
}

function sendEmail(emailProps, queryIds, userId){
  console.log('sendEmail', emailProps, queryIds, userId)
  return Promise.resolve({ ok: true })
}

function saveSendEmailDraft(emailProps, userId) {
  console.log('saveSendEmailDraft', emailProps, userId)
  return Promise.resolve({ ok: true })
}

function sendEscalationEmail(emailProps, queryIds, userId){
  console.log('sendEscalationEmail', emailProps, queryIds, userId)
  return Promise.resolve({ ok: true })
}

function saveEscalationEmailDraft(emailProps, userId) {
  console.log('saveEscalationEmailDraft', emailProps, userId)
  return Promise.resolve({ ok: true })
}

function updateWatchers(queryId, userIds){
  return patch(`/queries/${queryId}/watchers`, {userIds});
}

function uploadFile(file){
  const formData  = new FormData();
  formData.append('file', file);
  return fetch(API_BASE + '/files', {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  .then(resp=>{
    if(resp.ok){
      return resp.json();
    }else{
      throw new Error('File upload failed');
    }
  });
}

function createComment(entity){
  return Promise.all(entity.files.map(file=>{
    return uploadFile(file).then(result=>result.id);
  })).then(attachmentIds=>{
    unset(entity, 'files');
    return post('/sdmComments', {
      ...entity,
      attachmentIds,
    });
  });
}

function createQuery(entity){
  return Promise.all(entity.files.map(file=>{
    return uploadFile(file).then(result=>result.id);    
  })).then(attachmentIds=>{
    unset(entity, 'files');
    return post('/queries', {
      ...entity,
      attachmentIds,
    });
  })
}

let importQueriesXHR;

function importQueries(file, onProgress){
  return new Promise((resolve, reject)=>{
    const formData  = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_BASE + '/importQueries');
    xhr.withCredentials = true;
    xhr.onload = e=>resolve(e.target);
    xhr.onerror = reject;
    if (xhr.upload)
      xhr.upload.onprogress = onProgress;
    xhr.send(formData);
    importQueriesXHR = xhr;
  });
}

function patchQuery(id, entity){
  return patch(`/queries/${id}`, entity);
}

function downloadAttachment(attachment){
  return fetch(attachment.fileURL, {
    credentials: 'include'
  }).then(resp=>{
    if(resp.ok){
      resp.blob().then(data=>{
        saveAs(data, attachment.name);
      });
    }
  });
}

function readNotifications(){
  return put('/markAllNotificationsAsRead');
}

function cancelImport(){
  if(importQueriesXHR){
    importQueriesXHR.abort()
  }
}

function authGuard(resp){
  if(resp && resp.status === 401 && window.location.pathname !== '/' && window.location.pathname !== '/login'){
    window.location = '/';
  }
}

function getMe(){
  return get('/me');
}

export default {
  getNotifications,
  logout,
  getStatistics,
  getUsers,
  createUser,
  patchUser,
  removeUser,
  getEmailSettings,
  getExceptionTypes,
  saveEmailSettings,
  getSlaSettings,
  saveSlaSettings,
  getQueries,
  getCountries,
  getCurrencies,
  watchQuery,
  unwatchQuery,
  getQuery,
  exportQueries,
  reassignQueries,
  sendEmail,
  saveSendEmailDraft,
  sendEscalationEmail,
  saveEscalationEmailDraft,
  updateWatchers,
  createComment,
  createQuery,
  importQueries,
  patchQuery,
  downloadAttachment,
  readNotifications,
  cancelImport,
  getMe
};