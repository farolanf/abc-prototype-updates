import React, { Component } from 'react';
import PT from 'prop-types';
import {forEach, every, assign, trim} from 'lodash';
import * as moment from 'moment';
import utils from '../../utils';
import * as roles from '../../constants/roleTypes';
import * as statuses from '../../constants/statusTypes';
import UsersManagementTable from '../../components/UsersManagementTable';
import FilterUsersManagementTable from '../../components/FilterUsersManagementTable';
import './UsersManagement.scss';

const tabs = [{
  key: 'all',
  title: 'All Roles'
}, {
  key: roles.DELIVERY_USER,
  title: 'Delivery User'
}, {
  key: roles.MANAGEMENT_USER,
  title: 'Management User'
}, {
  key: roles.CONTRACT_ADMIN_USER,
  title: 'Contract Admin'
}]

// UsersManagement component
class UsersManagement extends Component {
  constructor(props) {
    super(props);

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.showFilter = this.showFilter.bind(this);
    this.closeFilter = this.closeFilter.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.activateTab = this.activateTab.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onChange = this.onChange.bind(this);
    this.createUser = this.createUser.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.selectUser = this.selectUser.bind(this);
    this.changeRole = this.changeRole.bind(this);
    
    this.state = {
      currentTab: 'all',
      modal: {},
      keyword: '',
      isFilterVisible: false,
      errors: {},
      email: '',
      role: roles.DELIVERY_USER,
      status: statuses.ACTIVE,
      selectedUser: null,
      filters: {}
    }
    this.tables = {};
  }

  componentDidMount(){
    this.loadData();
  }

  loadData(page){
    this.tables[this.state.currentTab].loadData(page);
  }

  getUsers(params){
    const {currentTab, keyword, filters} = this.state;
    assign(params, {
      ...filters,
      keyword: trim(keyword),
      roles: currentTab === 'all' ? null : currentTab
    });

    this.props.getUsers(currentTab, params);
  }

  /**
   * show/hide modal
   */
  showModal(name) {
    const obj = {
      modal: {}
    };
    obj.modal[name] = true;
    this.setState(obj);
    document.querySelector('body').classList.add('hasmodal');
  }
  closeModal(name) {
    const obj = {
      modal: {},
      selectedUser: null
    };
    obj.modal[name] = false;
    this.setState(obj, ()=>{
      if(name === 'isAddModal'){
        this.setState({
          email: '',
          errors: {
            ...this.state.errors,
            email: false
          }
        });
      }
    });
    document.querySelector('body').classList.remove('hasmodal');
  }
  /**
   * show/hide Filter
   */
  showFilter() {
    this.setState({
      isFilterVisible: true
    });
  }

  closeFilter() {
    this.setState({
      isFilterVisible: false
    });
  }

  applyFilter(params) {
    this.setState({
      filters: {
        email: params.email,
        createdOn: params.addOn ? moment(params.addOn).startOf('day').toDate() : null,
        name: params.username,
        status: params.status
      }
    }, ()=>this.loadData(1));
  }

  activateTab(tab) {
    this.setState({
      currentTab: tab,
      keyword: ''
    }, this.loadData);
  }

  onKeyUp(e){
    const key = e.which || e.keyCode;
    if (key === 13) {
      this.loadData(1);
    }
  }

  onChange(key){
    return (e)=>{
      const errors = {
        ...this.state.errors,
      }
      if(e.target.value){
        errors[key] = false;
      }
      this.setState({
        [key]: e.target.value,
        errors
      });
    }
  }

  createUser(){
    const errors = {};
    forEach(['email', 'role', 'status'], key=>{
      if(!this.state[key]){
        errors[key] = true;
      }else{
        errors[key] = false;
      }
    })
    if(this.state.email && !utils.validateEmail(this.state.email)){
      errors.email = true;
    }
    this.setState({
      errors
    });

    const {email, status, role} = this.state;
    if(every(errors,v=>v===false)){
      this.props.createUser({
        email: trim(email), status, role
      }).then(resp=>{
        if(resp.ok){
          this.loadData();
          this.setState({
            email: ''
          });
          this.closeModal('isAddModal');
        }
      })
    }
  }

  removeUser(){
    this.props.removeUser(this.state.selectedUser.id).then(resp=>{
      if(resp.ok){
        this.loadData();
        this.closeModal('isRemoveModal');
      }
    })
  }

  selectUser(user){
    this.setState({
      selectedUser: user,
      roleToUpdate: user.role
    });
  }

  changeRole(){
    const {selectedUser, roleToUpdate} = this.state;
    this.props.patchUser(selectedUser.id, {role: roleToUpdate}).then(resp=>{
      if(resp.ok){
        this.closeModal('isChangeModal');
      }
    })
  }

  render() {
    const { lookup, users, blockUser} = this.props;
    const { currentTab, keyword, errors, email, role, status, roleToUpdate, selectedUser} = this.state;

    return (
      <div className="subpage user-management">
        <header className="page-header">
          <h2 className="page-title">Users Management</h2>
        </header>

        <div className="table-view-opts">
          <ul className="list">
            {
              tabs.map(tab=>(
                <li key={tab.key} className={currentTab === tab.key ? 'on' : ''}
                onClick={() => this.activateTab(tab.key)} >{tab.title}</li>
              ))
            }
          </ul>

          <div className="query-btns">
            <div className="search-wrap">
              <input type="search" className="input-ctrl search-ctrl" placeholder="Search user" value={keyword} onKeyUp={this.onKeyUp} onChange={this.onChange('keyword')}/>
            </div>
            <button className="btn" onClick={this.showFilter}>
              <span className="ico-filter">Filter</span>
            </button>
            <button className="btn" onClick={() => this.showModal('isAddModal')}>
              <span className="ico-add-user">Add User</span>
            </button>
          </div>
        </div>

        <FilterUsersManagementTable
          applyFilter={this.applyFilter}
          closeFilter={this.closeFilter}
          lookup={this.props.lookup}
          className={this.state.isFilterVisible ? 'open' : ''}
        />

        {
          tabs.map(tab=>(
            <UsersManagementTable
              key={tab.key}
              ref={e=>{this.tables[tab.key] = e}}
              className={currentTab!==tab.key ? 'hidden': ''}
              showModal={this.showModal}
              dataset={users[tab.key]}
              getUsers={this.getUsers}
              blockUser={blockUser}
              selectUser={this.selectUser}
            />
          ))
        }
        
        {/* /.query-table */}

        {
          this.state.modal && this.state.modal.isAddModal &&
          <div className="modal-wrap">
            <div className="modal modal-add-user">
              <header>
                <h2 className="modal-title">Add User</h2>
                <a className="close-modal" onClick={() => this.closeModal('isAddModal')}> </a>
              </header>
              <div className="modal-content pad-t">

                <form className="add-user">
                  <div className="fieldset">
                    <label>Email Address</label>
                    <div className="field-val">
                      <input type="text" className={`input-ctrl ${errors.email ? 'error': ''}`} onChange={this.onChange('email')} value={email}/>
                    </div>
                  </div>

                  <div className="fieldset">
                    <label>Role</label>
                    <div className="field-val">
                      <select onChange={this.onChange('role')} value={role}>
                        {
                          lookup.roleOpts && lookup.roleOpts.map((item, i) => {
                            return (<option key={i}> {item.value} </option>)
                          })
                        }
                      </select>
                    </div>
                  </div>

                  <div className="fieldset">
                    <label>Status</label>
                    <div className="field-val">
                      <select onChange={this.onChange('status')} value={status}>
                        {
                          lookup.statusOpts && lookup.statusOpts.map((item, i) => {
                            return (<option key={i} value={item.value}>{item.value}</option>)
                          })
                        }
                      </select>
                    </div>
                  </div>

                </form>
                {/* /.add-user */}

              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={this.createUser}>Submit</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isAddModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-bulk-process */}
          </div>
        }
        {
          this.state.modal && this.state.modal.isChangeModal &&
          <div className="modal-wrap">
            <div className="modal modal-add-user">
              <header>
                <h2 className="modal-title">Edit User</h2>
                <a className="close-modal" onClick={() => this.closeModal('isChangeModal')}> </a>
              </header>
              <div className="modal-content pad-t">

                <form className="add-user">
                  <div className="fieldset">
                    <label>Username or Email Address</label>
                    <div className="field-val">
                      <input type="text" className="input-ctrl" disabled value={selectedUser.email}/>
                    </div>
                  </div>

                  <div className="fieldset">
                    <label>Role</label>
                    <div className="field-val">
                      <select onChange={this.onChange('roleToUpdate')} value={roleToUpdate}>
                        {
                          lookup.roleOpts && lookup.roleOpts.map((item, i) => {
                            return (<option key={i}> {item.value} </option>)
                          })
                        }
                      </select>
                    </div>
                  </div>
                </form>
                {/* /.add-user */}

              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={this.changeRole}>Update</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isChangeModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-bulk-process */}
          </div>
        }
        {
          this.state.modal && this.state.modal.isRemoveModal &&
          <div className="modal-wrap">
            <div className="modal modal-msg">
              <header>
                <h2 className="modal-title">Remove User</h2>
                <a className="close-modal" onClick={() => this.closeModal('isRemoveModal')}> </a>
              </header>
              <div className="modal-content pad-t">

                <div className="msg">Are you sure you want to remove this user?</div>
                {/* /.add-user */}

              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={this.removeUser}>Yes</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isRemoveModal')}>No</a>
                </div>
              </footer>
            </div>
            {/* /.modal-bulk-process */}
          </div>
        }
      </div>
    );
  }
}

UsersManagement.propType = {
  params: PT.object,
  lookup: PT.object,
}

export default UsersManagement;
