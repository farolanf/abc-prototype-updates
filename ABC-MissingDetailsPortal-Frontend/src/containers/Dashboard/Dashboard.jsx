import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dataAction from '../../actions/appdata.action';
import * as dashboardAction from '../../actions/dashboard.action';
import * as lookupAction from '../../actions/lookup.action';
import * as usersAction from '../../actions/users.action';
import Auth from '../../containers/Auth';
import DefaultTemplate from '../../containers/DefaultTemplate';
import DashboardComponent from '../../components/DashboardComponent';
import * as statuses from '../../constants/queryStatusTypes';
import * as userStatuses from '../../constants/statusTypes';
import DataSvc from '../../services/data.svc';


class Dashboard extends Component {
  componentDidMount() {
    this.props.dashboardAction.getStatistics();
    this.props.lookupAction.getExceptionTypes();
    this.props.lookupAction.getCountries();
    this.props.lookupAction.getCurrencies();
  }

  loadUsers(keyword, roles){
    this.props.usersAction.getUsers('all', {keyword, perPage: 10, status: userStatuses.ACTIVE, roles: roles === 'all' ? null : (roles||[]).join(',')});
  }

  createComment(entity){
    return this.props.dashboardAction.createComment(entity).then(resp=>{
      if(resp.ok){
        this.props.dashboardAction.getStatistics();
      }
      return resp;
    })
  }

  render() {
    const {dashboardAction:{getQueries, watchQuery, unwatchQuery, reassignQueries, sendEmail, saveSendEmailDraft, sendEscalationEmail, saveEscalationEmailDraft, massEdit, updateWatchers, getQuery, changeRequestor, updateQuery}, user, statistics, 
      allQueries, newQueries, openQueries, closedQueries, rejectedQueries, lookup, users } = this.props;

    return (
      <Auth>
        <DefaultTemplate user={user}>
          <DashboardComponent
            user={user} 
            meta={statistics}
            getQueries={getQueries}
            watchQuery={watchQuery}
            unwatchQuery={unwatchQuery}
            queries={{
              'all': allQueries,
              [statuses.NEW]: newQueries,
              [statuses.OPEN]: openQueries,
              [statuses.CLOSED]: closedQueries,
              [statuses.REJECTED]: rejectedQueries
            }}
            lookup={lookup}
            exportQueries={DataSvc.exportQueries}
            users={users.allUsers.results}
            loadUsers={this.loadUsers.bind(this)}
            reassignQueries={reassignQueries}
            sendEmail={sendEmail}
            saveSendEmailDraft={saveSendEmailDraft}
            sendEscalationEmail={sendEscalationEmail}
            saveEscalationEmailDraft={saveEscalationEmailDraft}
            massEdit={massEdit}
            updateWatchers={updateWatchers}
            createComment={this.createComment.bind(this)}
            getQuery={getQuery}
            changeRequestor={changeRequestor}
            updateQuery={updateQuery}
            downloadAttachment={DataSvc.downloadAttachment}
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
    ...state.dashboardReducer,
    lookup: state.lookupReducer,
    users: state.usersReducer
  }
};

const matchDispatchToProps = (dispatch) => {
  return {
    dataAction: bindActionCreators({ ...dataAction }, dispatch),
    dashboardAction: bindActionCreators({ ...dashboardAction }, dispatch),
    lookupAction: bindActionCreators({...lookupAction}, dispatch),
    usersAction: bindActionCreators({...usersAction}, dispatch)
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(Dashboard));
