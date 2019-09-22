import React, { Component } from 'react';
import PT from 'prop-types';
import { NavLink } from 'react-router-dom';
import { get } from 'lodash';
import * as roles from '../../constants/roleTypes';
import './Sidebar.scss';

// sidebar component: This component contains all the navigation links to differnt components
class Sidebar extends Component {
  render() {
    const { location, user } = this.props.params;
    const pathname = location ? location.pathname.toLowerCase() : '';
    return (
      <aside className="sidebar">
        <h2 className="logo"><NavLink to="/dashboard" className="logo-link">MPS</NavLink></h2>
        <nav className="group">

          <div className="logger-info">
            <figure className="logger-thumb">
              <img src={get(user, 'profilePicture.fileURL')} alt="" />
            </figure>
            <div className="meta alt">{get(user, 'firstName')} {get(user, 'lastName')}</div>
            <div className="meta">{get(user, 'role', '')}</div>
          </div>

          {/* delivery_user, management_user and contract_admin  nav */}
          {get(user, 'role') !== roles.SUPER_USER &&
            <ul className="list">
              <li className={'nav-dashboard ' + (pathname === '/dashboard' ? 'on' : '')}>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </li>
            </ul>
          }
          {/* super_user nav */}
          {get(user, 'role') === roles.SUPER_USER &&
            <ul className="list">
              <li className={'nav-dashboard multiline ' + (pathname === '/dashboard' ? 'on' : '')}>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </li>
              <li className={'nav-users multiline ' + (pathname === '/usersmanagementpage' ? 'on' : '')}>
                <NavLink to="/usersManagementPage" className="users" >Users Management</NavLink>
              </li>
              <li className={'nav-email multiline ' + (pathname === '/emailnotifications' ? 'on' : '')}>
                <NavLink to="/emailNotifications" className="email" >Email Notifications</NavLink>
              </li>
              <li className={'nav-sla multiline ' + (pathname === '/sla' ? 'on' : '')}>
                <NavLink to="/sla" className="sla" >SLA Settings</NavLink>
              </li>
            </ul>
          }


        </nav>
      </aside>
    );
  }
}

Sidebar.propType = {
  params: PT.object
}

export default Sidebar;
