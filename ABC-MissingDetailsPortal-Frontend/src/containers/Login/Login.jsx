import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { parse } from 'query-string';

import * as authAction from '../../actions/auth.action';
import LoginForm from '../../components/LoginForm';
import Wrapper from '../Wrapper';
import {API_BASE} from '../../config';
import '../../containers/Login/Login.scss';

class Login extends Component {
  constructor(props) {
    super(props);

    this.loginUser = this.loginUser.bind(this);
  }

  componentDidMount(){
    this.props.authAction.getMe(true);
  }

  // function to login the user
  loginUser() {
    window.location.href = `${API_BASE}/saml/login`;
  }

  render() {
    const {message} = parse(this.props.location.search);
    return (
      <Wrapper>
        <div className="login-page">
          <LoginForm loginUser={this.loginUser} errorMsg={message}/>
        </div>
      </Wrapper>
    )
  }
}



const mapStateToProps = (state) => {
  return {
    ...state.authReducer
  }
};

const matchDispatchToProps = (dispatch) => {
  return {
    authAction: bindActionCreators({ ...authAction }, dispatch)
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(Login));
