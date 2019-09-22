import React, { Component } from 'react';
import {get, filter, findIndex, remove} from 'lodash';
import RadioCtrl from '../RadioCtrl';
import './UserSelector.scss';

export default class UserSelector extends Component {
  constructor(props){
    super(props);
    this.state={
      keyword: '',
      selected: props.selected || []
    }
  }

  componentDidMount(){
    this.props.loadUsers('', this.props.roles);
  }

  handleChange = value=>{
    const {loadUsers, roles} = this.props;
    this.setState({
      keyword: value
    }, ()=>{
      loadUsers(this.state.keyword, roles);
    })
  }

  onChange = (user, value)=>{
    const {multi, onChange} = this.props;
    if(multi){
      const {selected} = this.state;
      if(value){
        selected.push(user);
      }else{
        remove(selected, ['id', user.id]);
      }
      this.setState({selected}, ()=>onChange(this.state.selected));
    }else{
      onChange(user);
    }
  }

  filteredUser = ()=>{
    const {excludes, users} = this.props;
    if(excludes){
      return filter(users, u=>findIndex(excludes, ['id', u.id])<0)
    }else{
      return users;
    }
  }

  isSelected = user=>{
    return findIndex(this.state.selected, ['id', user.id]) >= 0;
  }

  render(){
    const { className, title, toggle, multi, buttonTitle} = this.props;
    const { keyword } = this.state;
    return (<div className={'popup-window ' + className}>
      <h5>{title}</h5>
      <a className="close-popup" onClick={() => toggle(false)}> </a>

      <div className="search-bar">
        <input className="input-ctrl" type="search" placeholder="Enter username or email" value={keyword} onChange={e=>this.handleChange(e.target.value)} />
        {
          keyword &&
          <a className="clear-search" onClick={() => this.handleChange('')} > </a>
        }
      </div>
      <ul className="watcher-history">
        {
          this.filteredUser().map((user, i) => {
            return (
              <li key={i}>
                <div className="u-name"><a>{get(user, 'firstName', '') + ' ' + get(user, 'lastName', '')}</a></div>
                <div className="u-mail">{user.email}</div>
                {
                  multi ?
                  (<RadioCtrl params={{ label: "", isChecked: this.isSelected(user) }} onChange={value=>this.onChange(user, value)}/>):
                  (<a className="btn btn-clear btn-add" onClick={()=>this.onChange(user)}>{buttonTitle || 'Select'}</a>)
                }
              </li>
            )
          })
        }
      </ul>
    </div>)
  }
}