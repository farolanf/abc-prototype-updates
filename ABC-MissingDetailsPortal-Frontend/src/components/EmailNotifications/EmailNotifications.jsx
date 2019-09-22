import React, { Component } from 'react';
import PT from 'prop-types';
import {every, map, pull, cloneDeep, startCase} from 'lodash';
import RadioCtrl from '../RadioCtrl';
import './EmailNotifications.scss';

// EmailNotifications component
class EmailNotifications extends Component {
  toggleAll(value){
    const { lookup, updateSettings} = this.props;
    if(value){
      updateSettings('deliveryAndManagementUserEmailSettings.exceptionTypeIds', map(lookup.exceptionTypes, 'id'));
    }else{
      updateSettings('deliveryAndManagementUserEmailSettings.exceptionTypeIds', []);
    }
  }

  isAllChecked(){
    const { lookup, setting: {deliveryAndManagementUserEmailSettings: {exceptionTypeIds}}} = this.props;
    return every(lookup.exceptionTypes, type=>exceptionTypeIds.indexOf(type.id)>=0);
  }

  toggleSingleType(id, value){
    const { setting: {deliveryAndManagementUserEmailSettings: {exceptionTypeIds}}, updateSettings} = this.props;
    const ids = cloneDeep(exceptionTypeIds);
    if(value){
      ids.push(id);
    }else{
      pull(ids, id);
    }
    updateSettings('deliveryAndManagementUserEmailSettings.exceptionTypeIds', ids);
  }

  render() {
    const { lookup, setting: {deliveryAndManagementUserEmailSettings: dSettings, contractUserEmailSettings: cSettings}, updateSettings, saveSettings} = this.props;

    return (
      <div className="subpage single-query-form">
        <header className="page-header">
          <h2 className="page-title">Email Notifications</h2>
        </header>
        <div className="email-n-form">
          <div className="col-view">
            <h3>Delivery & Management User</h3>
            <div className="notification-opts">
              <div className="fieldset">
                <label>Email Frequency</label>
                <div className="val">
                  <div className="select-wrap">
                    <select className="select-ctrl" value={dSettings.emailsFrequency} 
                      onChange={e=>updateSettings('deliveryAndManagementUserEmailSettings.emailsFrequency', e.target.value)}>
                      {
                        lookup.emailFreqOpts && lookup.emailFreqOpts.map((item, i) => {
                          return (
                            <option key={i} value={item.value}>{startCase(item.value)}</option>
                          )
                        })
                      }
                    </select>
                  </div>
                </div>
              </div>
              {
                <div className="fieldset">
                  <label>Send emails for</label>
                  <ul className="val">
                    <li>
                      <RadioCtrl params={{ label: 'New Queries', isChecked: dSettings.newQueries }} 
                        onChange={e=>updateSettings('deliveryAndManagementUserEmailSettings.newQueries', e)}/>
                    </li>
                    <li>
                      <RadioCtrl params={{ label: 'Open Queries', isChecked: dSettings.openQueries }} 
                        onChange={e=>updateSettings('deliveryAndManagementUserEmailSettings.openQueries', e)}/>
                    </li>
                    <li>
                      <RadioCtrl params={{ label: 'All Query types', isChecked: this.isAllChecked() }} 
                        onChange={this.toggleAll.bind(this)}/>
                    </li>
                    {
                      lookup.exceptionTypes.map(type=>(
                        <li key={type.id} className="child">
                          <RadioCtrl params={{ label: type.value, isChecked: dSettings.exceptionTypeIds.indexOf(type.id) >= 0 }} 
                            onChange={e=>this.toggleSingleType(type.id, e)}/>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              }
            </div>
          </div>
          <div className="col-view">
            <h3>Contract User</h3>
            <div className="notification-opts">
              <div className="fieldset">
                <label>Email Frequency</label>
                <div className="val">
                  <div className="select-wrap">
                    <select className="select-ctrl" value={cSettings.emailsFrequency}
                      onChange={e=>updateSettings('contractUserEmailSettings.emailsFrequency', e.target.value)}>
                      {
                        lookup.emailFreqOpts && lookup.emailFreqOpts.map((item, i) => {
                          return (
                            <option key={i} value={item.value}>{startCase(item.value)}</option>
                          )
                        })
                      }
                    </select>
                  </div>
                </div>
              </div>
              {
                <div className="fieldset">
                  <label>Send emails for</label>
                  <ul className="val">
                    <li>
                      <RadioCtrl params={{ label: 'New Queries', isChecked: cSettings.newQueries }} 
                        onChange={e=>updateSettings('contractUserEmailSettings.newQueries', e)}/>
                    </li>
                    <li>
                      <RadioCtrl params={{ label: 'Open Queries', isChecked: cSettings.openQueries }} 
                        onChange={e=>updateSettings('contractUserEmailSettings.openQueries', e)}/>
                    </li>
                    <li>
                      <RadioCtrl params={{ label: 'Closed Queries', isChecked: cSettings.closedQueries }} 
                        onChange={e=>updateSettings('contractUserEmailSettings.closedQueries', e)}/>
                    </li>
                    <li>
                      <RadioCtrl params={{ label: 'Rejected Queries', isChecked: cSettings.rejectedQueries }} 
                        onChange={e=>updateSettings('contractUserEmailSettings.rejectedQueries', e)}/>
                    </li>
                  </ul>
                </div>
              }
            </div>
          </div>
        </div>
        <div className="form-actions">
          <a className="btn md" onClick={saveSettings}>Save Change</a>
        </div>
      </div>
    );
  }
}

EmailNotifications.propType = {
  params: PT.object
}

export default EmailNotifications;
