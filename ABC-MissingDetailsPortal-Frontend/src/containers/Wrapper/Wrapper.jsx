import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authAction from '../../actions/auth.action';
import * as appAction from '../../actions/appdata.action';
import './Wrapper.scss';

// DefaultTemplate component
class DefaultTemplate extends Component {
  componentDidMount(){

  }

  render() {
    const { appData: {loading, messages}, appAction: { hideMessage }} = this.props;

    return (
      <div className="main-wrapper">
        {this.props.children}
        {
          loading &&
          <div className="loading">
            <div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
          </div>
        }
        <div className="messages">
          {
            messages.map(msg=>(
              msg.messageBox
                ? (
                  <div key={msg.id} className="modal-wrap">
                    <div className="modal modal-message-box">
                      <header>
                        <h2 className="modal-title">{msg.title}</h2>
                        <a className="close-modal" onClick={() => hideMessage(msg.id)}> </a>
                      </header>
        
                      <div className="modal-content pad-t-lg pad-b ct">
                        <div className={`ico-check-circle hero-icon`} />
                        {msg.text}
                      </div>
        
                      <footer className="modal-footer modal-actions mt-md ct">
                        <a className="btn" onClick={() => hideMessage(msg.id)}>Ok</a>
                      </footer>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className={`message ${msg.error ? 'error' : ''}`}>{msg.text}</div>
                )
            ))
          }
        </div>
      </div>
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
