import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as lookupAction from '../../actions/lookup.action';
import * as usersAction from '../../actions/users.action';
import * as creationAction from '../../actions/creation.action';
import * as dashboardAction from '../../actions/dashboard.action';
import Auth from '../../containers/Auth';
import DefaultTemplate from '../../containers/DefaultTemplate';
import SingleQueryForm from '../../components/SingleQueryForm';
import * as userStatuses from '../../constants/statusTypes';

class SingleQueryPage extends Component {
  componentDidMount(){
    this.props.lookupAction.getExceptionTypes();
    this.props.lookupAction.getCountries();
    this.props.lookupAction.getCurrencies();
  }

  getQueries(params){
    return this.props.dashboardAction.getQueries('all', params);
  }

  loadUsers(keyword, roles){
    this.props.usersAction.getUsers('all', {keyword, perPage: 10, status: userStatuses.ACTIVE, roles: roles === 'all' ? null : (roles||[]).join(',')});
  }

  render() {
    const { lookup, user, users, creationAction: {createQuery}, dashboard} = this.props;

    return (
      <Auth>
        <DefaultTemplate user={user} noSearch>
          <SingleQueryForm user={user}
            lookup={ lookup }
            users={users.allUsers.results}
            createQuery={createQuery}
            getQueries={this.getQueries.bind(this)}
            queries={dashboard.allQueries}
            loadUsers={this.loadUsers.bind(this)}
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
    dashboard: state.dashboardReducer,
    lookup: state.lookupReducer,
    users: state.usersReducer
  }
};

const matchDispatchToProps = (dispatch) => {
  return {
    lookupAction: bindActionCreators({...lookupAction}, dispatch),
    usersAction: bindActionCreators({...usersAction}, dispatch),
    creationAction: bindActionCreators({...creationAction}, dispatch),
    dashboardAction: bindActionCreators({...dashboardAction}, dispatch)
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(SingleQueryPage));
