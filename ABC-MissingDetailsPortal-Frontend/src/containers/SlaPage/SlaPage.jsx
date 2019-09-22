import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {omit, map} from 'lodash';
import * as settingAction from '../../actions/setting.action';
import * as lookupAction from '../../actions/lookup.action';
import Auth from '../../containers/Auth';
import DefaultTemplate from '../../containers/DefaultTemplate';
import SLA from '../../components/SLA';

class SlaPage extends Component {
  componentDidMount() {
    this.loadData();
  }

  loadData(){
    this.props.settingAction.getSlaSettings();
    this.props.lookupAction.getExceptionTypes();
  }

  updateSettings(path, value){
    this.props.settingAction.updateSettings('sla.' + path, value);
  }

  saveSettings(){
    this.props.settingAction.saveSlaSettings({queryTypeSLAs: map(this.props.sla, item=>omit(item, 'id'))}).then(resp=>{
      if(resp.ok){
        this.loadData();
      }
    })
  }

  render() {
    const { lookup, sla, user } = this.props;

    return (
      <Auth>
        <DefaultTemplate user={user} noSearch>
          <SLA lookup={ lookup } setting={sla} 
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
    lookupAction: bindActionCreators({...lookupAction}, dispatch)
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(SlaPage));
