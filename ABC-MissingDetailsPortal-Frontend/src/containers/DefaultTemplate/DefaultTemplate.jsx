import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Sidebar from '../../components/Sidebar';
import MainHeader from '../../components/MainHeader';
import * as authAction from '../../actions/auth.action';
import * as appAction from '../../actions/appdata.action';
import {REFRESH_NOTIFICATION_INTERVAL} from '../../config';
import DataSvc from '../../services/data.svc';
import Wrapper from '../Wrapper';
import './DefaultTemplate.scss';

// DefaultTemplate component
class DefaultTemplate extends Component {
  componentDidMount(){
    this.props.authAction.getMe();
    const {getNotifications} = this.props.appAction;
    getNotifications();
    this.timer = setInterval(getNotifications, REFRESH_NOTIFICATION_INTERVAL);
  }

  componentWillUnmount(){
    if(this.timer){
      clearInterval(this.timer);
    }
  }

  readNotifications(){
    return DataSvc.readNotifications();
  }

  render() {
    const { user, authAction: {logout}, appAction: {getNotifications}, appData: {notifications}, location, noSearch} = this.props;

    const params = {
      searchPlaceholder: "Enter Query ID",
      notifications
    }

    return (
      <Wrapper>
        <div className="pageview">
          <Sidebar params={{user, location}} />
          <main className="main">
            <MainHeader 
              params={params} 
              logout={logout} 
              noSearch={noSearch} 
              readNotifications={this.readNotifications.bind(this)}
              getNotifications={getNotifications}/>
            {this.props.children}
          </main>
        </div>
      </Wrapper>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    ...state.authReducer,
    appData: state.appdataReducer,
  }
};

const matchDispatchToProps = (dispatch) => {
  return {
    authAction: bindActionCreators({ ...authAction }, dispatch),
    appAction: bindActionCreators({ ...appAction }, dispatch),
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(DefaultTemplate));
