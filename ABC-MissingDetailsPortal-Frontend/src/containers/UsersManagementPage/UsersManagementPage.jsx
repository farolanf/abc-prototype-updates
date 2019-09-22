import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as usersAction from '../../actions/users.action';
import Auth from '../../containers/Auth';
import DefaultTemplate from '../../containers/DefaultTemplate';
import UsersManagement from '../../components/UsersManagement';
import * as roles from '../../constants/roleTypes';
import * as statuses from '../../constants/statusTypes';
import './UsersManagementPage.scss';

class UsersManagementPage extends Component {
  createUser(entity){
    return this.props.usersAction.createUser(entity);
  }

  patchUser(id, entity){
    return this.props.usersAction.patchUser(id, entity);
  }

  blockUser(user){
    return this.patchUser(user.id, {
      status: user.status === statuses.ACTIVE ? statuses.BLOCKED : statuses.ACTIVE
    });
  }

  removeUser(id){
    return this.props.usersAction.removeUser(id);
  }

  render() {
    const { usersAction: {getUsers}, lookup, allUsers, deliveryUsers, manageUsers, adminUsers, user} = this.props;
    return (
      <Auth>
        <DefaultTemplate user={user}>
          <UsersManagement 
            getUsers={getUsers}
            createUser={this.createUser.bind(this)}
            blockUser={this.blockUser.bind(this)}
            removeUser={this.removeUser.bind(this)}
            patchUser={this.patchUser.bind(this)}
            lookup={ lookup }
            users={{
              'all': allUsers,
              [roles.DELIVERY_USER]: deliveryUsers,
              [roles.MANAGEMENT_USER]: manageUsers,
              [roles.CONTRACT_ADMIN_USER]: adminUsers
            }}
           />
        </DefaultTemplate>
      </Auth>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    ...state.authReducer,
    ...state.appdataReducer,
    ...state.usersReducer,
    lookup: state.lookupReducer
  }
};

const matchDispatchToProps = (dispatch) => {
  return {
    usersAction: bindActionCreators({ ...usersAction }, dispatch)
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(UsersManagementPage));
