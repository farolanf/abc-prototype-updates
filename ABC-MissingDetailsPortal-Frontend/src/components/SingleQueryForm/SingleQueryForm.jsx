import React, { Component } from 'react';
import PT from 'prop-types';
import { NavLink } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import * as moment from 'moment';
import {includes, filter, pick, get, every, noop, omit, map, keys, pull, unset, trim, forEach} from 'lodash';
import FileDragDrop from '../../components/FileDragDrop';
import RadioCtrl from '../RadioCtrl';
import * as roles from '../../constants/roleTypes';
import ReferenceTable from '../ReferenceTable';
import UserSelector from '../UserSelector';
import './SingleQueryForm.scss';

// SingleQueryForm component
class SingleQueryForm extends Component {
  constructor(props) {
    super(props);

    this.toggleReference = this.toggleReference.bind(this);
    this.selectReference = this.selectReference.bind(this);
    this.createQuery = this.createQuery.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.clearError = this.clearError.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.filterUsers = this.filterUsers.bind(this);
    this.formatWatchers = this.formatWatchers.bind(this);

    this.defaultForm = {
      exceptionTypeId: 1,
      exceptionSubType: '',
      countryId: 1,
      accountName: '',
      ampId: '',
      billingIndex: '',
      billingStartDate: null,
      billingEndDate: null,
      sapContract: '',
      valueToBeBilled: '',
      currencyId: 1,
      dueDate: null,
      sdm: null,
      rework: false,
      reworkReason: '',
      dmpsPmps: '',
      comment:'',
      files: [],
      watchers: []
    }
    this.stringFields = pull(keys(this.defaultForm), 'exceptionTypeId', 'countryId', 'billingStartDate', 'billingEndDate', 'currencyId', 
      'dueDate', 'sdm', 'rework', 'files', 'watchers');
    this.state = {
      form:{
        ...this.defaultForm
      },
      refrencedRecord: null,
      errors: {},
      modal: false,
    }
  }

  /* selects a refrence */
  selectReference(query) {
    this.setState({
      form: {
        ...pick(query, pull(keys(this.defaultForm), 'files')),
        billingStartDate: query.billingStartDate ? moment(query.billingStartDate) : null,
        billingEndDate: query.billingEndDate ? moment(query.billingEndDate) : null,
        dueDate: query.dueDate ? moment(query.dueDate) : null,
        files: []
      },
      refrencedRecord: query,
      isSelectedReference: false
    }, this.validate);
  }

  // toggleReference
  toggleReference(isSelected) {
    this.setState({
      isSelectedReference: isSelected
    })
  }

  //handleChange
  handleChange(key, value) {
    if(key === 'valueToBeBilled' && value  && (!/^(0|([1-9]\d{0,}))(\.\d{0,})?$/.test(value) || value.length > 30)){
      return;
    }
    if(['billingStartDate', 'billingEndDate', 'dueDate'].indexOf(key) >= 0){
      setTimeout(()=>{
        document.activeElement.blur();
      });
    }
    this.setState({ form: {...this.state.form, [key]: value }});
  }

  togglePopup(name){
    if(name === this.state.modal){
      name = null;
    }
    this.setState({
      modal: name
    });
  }

  validate(){
    const {form} = this.state;
    const fields = pull(keys(this.defaultForm), 'exceptionSubType', 'rework', 'reworkReason', 'comment', 'files', 'watchers');
    if(form.rework){
      fields.push('reworkReason');
    }
    const errors = {};
    for (let i = 0; i < fields.length; i++) {
      if(this.stringFields.indexOf(fields[i]) >= 0){
        errors[fields[i]] = !trim(form[fields[i]]);
      }else{
        errors[fields[i]] = !form[fields[i]];
      }
    }

    this.setState({
      errors: errors
    });
    return every(errors, v=>v===false);
  }

  // createQuery
  createQuery() {
    if(this.validate()) {
      const {form} = this.state;
      const entity = omit(form, ['watchers', 'sdm']);
      if(!entity.rework){
        unset(entity, 'reworkReason');
      }
      entity.sdmId = get(form.sdm, 'id');
      entity.watcherIds = map(get(form, 'watchers', []), 'id');
      entity.requestorId = this.props.user.id;
      // trim spaces
      forEach(this.stringFields, k=>{
        entity[k] = trim(entity[k]);
      });
      this.props.createQuery(entity);
    }
  }

  clearError(errorFieldId){
    const errors = this.state.errors;
    errors[errorFieldId] = false;
    this.setState({errors});
  }

  filterUsers(keyword){
    return filter(this.props.users, u=>includes(u.firstName, keyword)||includes(u.lastName, keyword)||includes(u.email, keyword));
  }

  formatWatchers(){
    const {watchers} = this.state.form;
    if(watchers && watchers.length > 0){
      const first = get(watchers[0], 'firstName', '') + ' ' + get(watchers[0], 'lastName', '');
      if(watchers.length > 1){
        return `${first} & ${watchers.length - 1} more`;
      }else{
        return first;
      }
    }
    return '';
  }

  render() {
    const { lookup, getQueries, queries, users, loadUsers} = this.props;
    const {form: {exceptionTypeId, exceptionSubType, countryId, accountName, ampId, billingIndex, billingStartDate, billingEndDate, sapContract, valueToBeBilled,
      currencyId, dueDate, sdm, rework, reworkReason, dmpsPmps, comment, watchers}, errors, modal, refrencedRecord}= this.state;
    
    return (
      <div className="subpage single-query-form">
        <header className="page-header">
          <h2 className="page-title">Single Query Creation</h2>
          {!this.state.isSelectedReference && <a className="btn btn-clear" onClick={() => this.toggleReference(true)}>Select Reference</a>}
        </header>
        {
          this.state.isSelectedReference
            ? <ReferenceTable
              toggleReference={this.toggleReference}
              selectReference={this.selectReference}
              getQueries={getQueries}
              dataset={queries}
            />
            : (
              <div className="query-form">
                {
                  refrencedRecord && (
                    <div className={"widget-ref " + refrencedRecord.status}>
                      <h3>Reference Query ID {refrencedRecord.id}</h3>
                      <div className="ref-status">{refrencedRecord.status}</div>
                      <div className="ref-comments">{refrencedRecord.comment}</div>
                    </div>
                  )
                }
                <div className="fieldset">
                  <label>Query Type</label>
                  <div className="field-val">
                    <select value={exceptionTypeId} onChange={(e) => this.handleChange('exceptionTypeId', e.target.value)} onClick={()=>this.clearError('exceptionTypeId')}
                      className={errors.exceptionTypeId ? 'error' : ''}>
                      {
                        lookup.exceptionTypes.map((item, i) => {
                          return (<option key={i} value={item.id}>{item.value}</option>)
                        })
                      }
                    </select>
                  </div>
                </div>

                <div className="fieldset">
                  <label>Query Sub-Type</label>
                  <div className="field-val">
                    <input type="text" value={exceptionSubType} onChange={(e) => this.handleChange('exceptionSubType', e.target.value)} onClick={()=>this.clearError('exceptionSubType')}
                      className={'input-ctrl ' + (errors.exceptionSubType ? 'error' : '')}/>
                  </div>
                </div>

                <div className="fieldset">
                  <label>Country</label>
                  <div className="field-val">
                    <select value={countryId} onChange={(e) => this.handleChange('countryId', e.target.value)}
                       onClick={()=>this.clearError('countryId')} className={errors.country ? 'error' : ''}>
                      {
                        lookup.countries.map((item, i) => {
                          return (<option key={i} value={item.id}>{item.value}</option>)
                        })
                      }
                    </select>
                  </div>
                </div>

                <div className="fieldset">
                  <label>Account</label>
                  <div className="field-val">
                    <input type="text" value={accountName}
                      onChange={e=>this.handleChange('accountName', e.target.value)} onClick={()=>this.clearError('accountName')} className={'input-ctrl ' + (errors.accountName ? 'error' : '')}
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>AMP ID</label>
                  <div className="field-val">
                    <input type="text" className={'input-ctrl ' + (errors.ampId ? 'error' : '')} value={ampId}
                      onChange={e=>this.handleChange('ampId', e.target.value)}
                      onClick={()=>this.clearError('ampId')}
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>Billing Index</label>
                  <div className="field-val">
                    <input type="text" className={'input-ctrl ' + (errors.billingIndex ? 'error' : '')} value={billingIndex}
                      onChange={e=>this.handleChange('billingIndex', e.target.value)}
                      onClick={()=>this.clearError('billingIndex')}
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>Billing Start Date</label>
                  <div className="field-val">
                    <DatePicker
                      selected={billingStartDate}
                      maxDate={billingEndDate || dueDate}
                      onFocus = {() => this.clearError('billingStartDate')}
                      onChange={(dateVal) => this.handleChange('billingStartDate', dateVal)}
                      className={'input-ctrl datepicker md ' + (errors.billingStartDate ? 'error' : '')}
                      placeholderText="mm/dd/yyyy"
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>Billing End Date</label>
                  <div className="field-val">
                    <DatePicker
                      selected={billingEndDate}
                      minDate={billingStartDate}
                      maxDate={dueDate}
                      onFocus = {() => this.clearError('billingEndDate')}
                      onChange={(dateVal) => this.handleChange('billingEndDate', dateVal)}
                      className={'input-ctrl datepicker md ' + (errors.billingEndDate ? 'error' : '')}
                      placeholderText="mm/dd/yyyy"
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>SAP Contract No</label>
                  <div className="field-val">
                    <input type="text" className={'input-ctrl ' + (errors.sapContract ? 'error' : '')} value={sapContract}
                      onChange={e=>this.handleChange('sapContract', e.target.value)}
                      onClick={()=>this.clearError('sapContract')}
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>Value to be billed</label>
                  <div className="field-val">
                    <input type="text" className={'input-ctrl ' + (errors.valueToBeBilled ? 'error' : '')} value={valueToBeBilled}
                      onChange={e=>this.handleChange('valueToBeBilled', e.target.value)}
                      onClick={()=>this.clearError('valueToBeBilled')}
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>Currency</label>
                  <div className="field-val">
                    <select value={currencyId} onChange={(e) => this.handleChange('currencyId', e.target.value)}
                      className={errors.currencyId ? 'error' : ''}
                      onClick={()=>this.clearError('currencyId')}
                    >
                      {
                        lookup.currencies.map((item, i) => {
                          return (<option key={i} value={item.id}>{item.value}</option>)
                        })
                      }
                    </select>
                  </div>
                </div>

                <div className="fieldset">
                  <label>Due Date</label>
                  <div className="field-val">
                    <DatePicker
                      selected={dueDate}
                      minDate={billingEndDate || billingStartDate}
                      onFocus = {() => this.clearError('dueDate')}
                      className={'input-ctrl datepicker md ' + (errors.dueDate ? 'error' : '')}
                      onChange={(dateVal) => this.handleChange('dueDate', dateVal)}
                      placeholderText="mm/dd/yyyy"
                    />
                  </div>
                </div>

                <div className="fieldset">
                  <label>Watcher</label>
                  <div className="field-val search-field">
                    <input type="text" className={'input-ctrl search-input sm ' + (errors.watchers ? 'error' : '')} value={this.formatWatchers()}
                      onChange={noop}
                      onClick={()=>this.togglePopup('showWatcherPop')}
                    />
                    {
                      'showWatcherPop'===modal &&
                      <UserSelector
                        className={'showWatcherPop'===modal ? ' open ' : ' '}
                        title="Assign Watcher"
                        toggle={()=>this.togglePopup('showWatcherPop')}
                        users={users}
                        loadUsers={loadUsers}
                        roles="all"
                        onChange={selected=>this.handleChange('watchers', selected)}
                        multi
                        selected={watchers}
                        />
                    }
                  </div>
                </div>

                <div className="fieldset">
                  <label>SDM</label>
                  <div className="field-val search-field">
                    <input type="text" className={'input-ctrl search-input sm ' + (errors.sdm ? 'error' : '')} value={get(sdm, 'firstName', '') + ' ' + get(sdm, 'lastName', '')}
                      onChange={noop}
                      onClick={()=>this.togglePopup('showSdmPopup')}
                    />
                    {
                      'showSdmPopup'===modal &&
                      <UserSelector
                        className={'showSdmPopup'===modal ? ' open ' : ' '}
                        title="Assign SDM"
                        toggle={()=>this.togglePopup('showSdmPopup')}
                        users={users}
                        loadUsers={loadUsers}
                        roles={[roles.DELIVERY_USER]}
                        onChange={user=>this.handleChange('sdm', user)}
                        />
                    }
                  </div>
                </div>

                <div className="fieldset">
                  <label>Rework</label>
                  <div className="field-val">
                    <RadioCtrl params={{ label: "Yes", isChecked: rework }} onChange={value=>this.handleChange('rework', value)}/>
                  </div>
                </div>

                {rework  &&
                <div className="fieldset">
                  <label>Rework Reason</label>
                  <div className="field-val">
                    <input type="text" className={'input-ctrl ' + (errors.reworkReason ? 'error' : '')} value={reworkReason}
                      onChange={e=>this.handleChange('reworkReason', e.target.value)}
                      onClick={()=>this.clearError('reworkReason')}
                    />
                  </div>
                </div>
                }

                <div className="fieldset">
                  <label>dMPS/pMPS</label>
                  <div className="field-val">
                    <select value={dmpsPmps} onChange={(e) => this.handleChange('dmpsPmps', e.target.value)}
                      className={errors.dmpsPmps ? 'error' : ''}
                      onClick={()=>this.clearError('dmpsPmps')}
                    >
                      <option value=""></option>
                      <option value="DMPS">DMPS</option>
                      <option value="PMPS">PMPS</option>
                    </select>
                  </div>
                </div>

                <div className="fieldset wider">
                  <label>Comments</label>
                  <div className="field-val">
                    <textarea className={'input-ctrl ' + (errors.comment ? 'error' : '')} value={comment}
                      onChange={e=>this.handleChange('comment', e.target.value)}
                      onClick={()=>this.clearError('comment')}
                      ></textarea>
                  </div>
                </div>

                <div className="fieldset wider">
                  <label>Attachments</label>
                  <div className="field-val">
                    <FileDragDrop onChange={value=>this.handleChange('files', value)}/>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn md" onClick={this.createQuery}>Create</button>
                  <NavLink className="btn btn-clear md" to="/dashboard">Cancel</NavLink>
                </div>

              </div>
            )
        }

        {/* /.query-form */}
      </div>
    );
  }
}

SingleQueryForm.propType = {
  params: PT.object
}

export default SingleQueryForm;
