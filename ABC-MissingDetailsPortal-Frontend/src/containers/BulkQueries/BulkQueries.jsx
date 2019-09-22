import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as creationAction from '../../actions/creation.action';
import Auth from '../../containers/Auth';
import DefaultTemplate from '../../containers/DefaultTemplate';
import BulkQueriesForm from '../../components/BulkQueriesForm';

class BulkQueries extends Component {
  render() {
    const {user, creationAction: {importQueries, cancelImport}, creation: {importError, uploadProgress}} = this.props;
    return (
      <Auth>
        <DefaultTemplate user={user} noSearch>
          <BulkQueriesForm 
            user={user} 
            importQueries={importQueries}
            importError={importError}
            uploadProgress={uploadProgress}
            cancelImport={cancelImport}
          />
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

export default connect(mapStateToProps, matchDispatchToProps)(withRouter(BulkQueries));
