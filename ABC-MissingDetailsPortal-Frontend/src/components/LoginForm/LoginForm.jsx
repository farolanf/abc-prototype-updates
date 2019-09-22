import React, { Component } from 'react';
import PT from 'prop-types';
import {Link} from 'react-router-dom';

import './LoginForm.scss';

// LoginForm component: This component contains the view & functions related to user loggin
class LoginForm extends Component {
  render() {
    const {errorMsg, loginUser} = this.props;
    return (
      <div className="login-form-wrap">
        <header className="login-header">
          <h1 className="logo">MPS</h1>
        </header>

        {!errorMsg && <h2 className="form-title">SSO Sign In</h2>}
        {errorMsg && <h2 className="form-title error">{atob(errorMsg)}</h2>}
        <div className="form-login">
          <div className="row-login">
            {!errorMsg && <button className="btn" onClick={loginUser}>Sign In</button>}
            {errorMsg && <Link className="btn" to="/login">OK</Link>}
          </div>
        </div>
        {/* form-login */}
      </div>
    );
  }
}

LoginForm.propType = {
  loginUser: PT.func,
}

export default LoginForm;
