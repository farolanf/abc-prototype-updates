import React, { Component } from 'react';
import PT from 'prop-types';
import {NavLink} from 'react-router-dom';
import UploadedTable from '../UploadedTable';
import './FileUploaded.scss';

// FileUploaded component
class FileUploaded extends Component {
  render() {
    return (
      <div className="subpage single-query-form">
        <header className="page-header">
          <h2 className="page-title">Bulk Query Creation</h2>
        </header>

        <div className="file-uploaded-wrap">
          <h3 className="title-subpage">Queries Created</h3>
        </div>
        <UploadedTable
          queries={this.props.queries}
        />
        {/* /.query-form */}
        <div className="form-actions">
          <NavLink className="btn md" to="/dashboard">OK</NavLink>
        </div>
      </div>
    );
  }
}

FileUploaded.propType = {
  params: PT.object
}

export default FileUploaded;
