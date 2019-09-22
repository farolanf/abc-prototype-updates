import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { omit } from 'lodash';
import * as settingAction from '../../actions/setting.action';
import * as lookupAction from '../../actions/lookup.action';
import Auth from '../../containers/Auth';
import DefaultTemplate from '../../containers/DefaultTemplate';
import EmailNotifications from '../../components/EmailNotifications';

class EmailNotificationsPage extends Component {
  componentDidMount() {
    this.loadData();
  }

  loadData(){
    this.props.settingAction.getEmailSettings();
    this.props.lookupAction.getExceptionTypes();
  }

  updateSettings(path, value){
    this.props.settingAction.updateSettings('email.' + path, value);
  }

  saveSettings(){
    this.props.settingAction.saveEmailSettings(omit(this.props.email, ['contractUserEmailSettings.id','deliveryAndManagementUserEmailSettings.id'])).then(resp=>{
      if(resp.ok){
        this.loadData();
      }
    })
  }

  render() {
    const { lookup, email, user } = this.props;

    return (
      <Auth>
        <DefaultTemplate user={user} noSearch>
          <EmailNotifications setting={email} lookup={lookup} 
            loadData={this.loadData.bind(this)} 
            updateSettings={this.updateSettings.bind(this)}
            saveSettings={this.saveSettings.bind(this)}/>
        </DefaultTemplate>
      </Auth>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    ...state.authReducer,
    ...state.settingReducer,
    lookup: state.lookupReducer
  }
};

const matchDispatchToProps = (dispatch) => {
  return {
    settingAction: bindActionCreators({ ...settingAction }, dispatch),
    lookupAction: bindActionCreators({ ...lookupAction }, dispatch)
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(EmailNotificationsPage));
