import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as creationAction from '../../actions/creation.action';
import Auth from '../../containers/Auth';
import DefaultTemplate from '../../containers/DefaultTemplate';
import FileUploaded from '../../components/FileUploaded';


class FileUploadedPage extends Component {
  render() {
    const {user, creation: {importedQueries}} = this.props;

    return (
      <Auth>
        <DefaultTemplate user={user} noSearch>
          <FileUploaded user={user} queries={importedQueries}/>
        </DefaultTemplate>
      </Auth>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    ...state.authReducer,
    creation: state.creationReducer
  }
};

const matchDispatchToProps = (dispatch) => {
  return {
    creationAction: bindActionCreators({...creationAction}, dispatch)
  }
};

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(FileUploadedPage));
