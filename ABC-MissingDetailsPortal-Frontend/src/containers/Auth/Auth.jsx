import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


class Auth extends Component {
  constructor(props) {
    super(props);

    this.checkAuth = this.checkAuth.bind(this);
  }

  checkAuth() {
    if(!this.props.user){
      setTimeout(() => {
        this.props.history.push('/');
      }, 10);
    }
  }

  componentWillMount() {
    this.checkAuth();
  }
  
  render() {
    return (
      this.props.children
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state.authReducer
  }
};

export default connect(mapStateToProps)(withRouter(Auth));
