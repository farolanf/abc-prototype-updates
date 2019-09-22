import React, { Component } from 'react';
import PT from 'prop-types';
import { NavLink } from 'react-router-dom';
import { isString, endsWith} from 'lodash';
import { BULK_QUERIES_TEMPLATE_URL } from '../../config';
import FileDragDrop from '../../components/FileDragDrop';
import './BulkQueriesForm.scss';

// BulkQueriesForm component
class BulkQueriesForm extends Component {
  constructor(props) {
    super(props);

    this.upload = this.upload.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      files: [],
      error: false
    }
  }

  // uploading
  upload() {
    const {files} = this.state;
    if(files.length === 0){
      this.setState({
        error: true
      });
    }else if(!this.state.error){
      this.props.importQueries(files[0]);
    }
  }

  handleChange(files){
    if(files.length > 0){
      if(endsWith(files[0].name, '.zip')){
        this.setState({
          files,
          error: false
        });
      }else{
        this.setState({
          files,
          error: 'Wrong file type, should be a zip file.'
        });
      }
    }else{
      this.setState({
        files,
        error: true
      });
    }
  }

  render() {
    const {importError, uploadProgress, cancelImport} = this.props;
    const {error} = this.state;
    return (
      <div className="subpage bulk-query-form">
        <header className="page-header">
          <h2 className="page-title">Bulk Queries Creation</h2>
          {importError && <span className="error-msg">{importError}</span>}
          {isString(error) && <span className="error-msg">{error}</span>  }
        </header>
        <div className={`uploading ${uploadProgress >= 0 ? 'hidden' : ''}`}>
          <div className="bulk-query-form-content">
            <div className="col-view">
              <h2>Upload File</h2>
              <div className={'col-view-con ' + (error ? 'error' : false)}>
                <FileDragDrop onChange={this.handleChange} single/>
              </div>
            </div>
            <div className="col-view col-instruction">
              <h2>Instructions</h2>
              <div className="col-view-con">
                <ul className="ins-list">
                  <li>
                    <span className="index">1</span>
                    Download bulk_query.csv file and desktop application
                    <div className="post-actions">
                      <a target="_blank" href={BULK_QUERIES_TEMPLATE_URL} className="btn md"><span className="ico-sheet">Bulk Query</span></a>
                      <button className="btn md"><span className="ico-desk">Desktop App</span></button>
                    </div>
                  </li>
                  <li>
                    <span className="index">2</span>
                    Enter the data in the bulk_query.csv file</li>
                  <li>
                    <span className="index">3</span>
                    If you have attachments,<br />make sure that you spell them correctly in the <strong><i>“attachment”</i></strong> column</li>
                  <li>
                    <span className="index">4</span>
                    If you have attachments,<br /><strong><i>separate their names by comma</i></strong> in the “attachment” column.</li>
                  <li>
                    <span className="index">5</span>
                    Place all the files in a folder<br />convert the folder into a <strong><i>.zip folder</i></strong> and upload here.</li>
                </ul>
              </div>
            </div>
          </div>

          <footer className="bulk-query-form-actions form-actions">
            <button onClick={this.upload} className="btn md">Upload</button>
            <NavLink to="/dashboard" className="btn btn-clear md">Cancel</NavLink>
          </footer>
        </div>
        {
          uploadProgress >= 0 &&
          <div className="uploading-section">
            <div className="col-view col-instruction">
              <h2>Processing...</h2>
              <div className="col-view-con">
                <div className="progress-bar">
                  <div className="filled" style={{ width: (uploadProgress) + '%' }}> </div>
                  <div className="pt">{uploadProgress}%</div>
                </div>
              </div>
            </div>
            {
              (uploadProgress < 100 || importError) &&
              <footer className="bulk-query-form-actions form-actions">
                <button className="btn btn-clear md" onClick={cancelImport}>Cancel</button>
              </footer>
            }
          </div>
          }
      </div>
    );
  }
}

BulkQueriesForm.propType = {
  params: PT.object
}

export default BulkQueriesForm;
