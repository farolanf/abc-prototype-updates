import React, { Component } from 'react';
import PT from 'prop-types';
import Dropzone from 'react-dropzone';
import './FileDragDrop.scss';

// FileDragDrop component
class FileDragDrop extends Component {
  constructor(props) {
    super(props);

    this.onAttachmentDrop = this.onAttachmentDrop.bind(this);
    this.removeAttachedFile = this.removeAttachedFile.bind(this);

    this.state = {
      attachments: []
    }
  }

  onAttachmentDrop(acceptedFiles) {
    if(this.props.single){
      acceptedFiles.splice(1, acceptedFiles.length);
    }else{
      acceptedFiles = this.state.attachments.concat(acceptedFiles);
    }
    this.setState({
      attachments: acceptedFiles
    }, ()=>{
      this.props.onChange(this.state.attachments);
    })
  }
  
  // removeAttachedFile
  removeAttachedFile(index) {
    const attachments = this.state.attachments;
    attachments.splice(index, 1);
    this.setState(attachments, ()=>{
      this.props.onChange(attachments);
    });
  }

  render() {
    const validateFileType = ".tiff, .pdf, .jpg, .jpeg, .bmp, .png, .doc, .docx, .xls, .xlsx, .xlsm, .gif, .zip, .ppt, .pptx, .rtf, .xml, .mht, .csv, .mdi, .ods, .msg, application/pdf, image/jpeg, image/jpg, image/tiff, image/bmp, image/png, image/gif, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.sheet.macroEnabled.12, application/zip, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/rtf, application/xml, multipart/related, text/csv, image/vnd.ms-modi, application/vnd.oasis.opendocument.spreadsheet, application/vnd.ms-outlook, application/octet-stream";
    return (
      <div className="file-drag-drop field-val">
        {
          this.state.attachments.length > 0 &&
          <ul className="files-dropped">
            {
              this.state.attachments && this.state.attachments.map((file, i) => {
                return (
                  <li key={i} className="file-el">
                    {file.name}
                    <a className="remove" onClick={() => this.removeAttachedFile(i)}> </a>
                  </li>
                )
              })
            }
          </ul>
        }
        <Dropzone className="drop-zone" onDrop={this.onAttachmentDrop} accept={validateFileType}>
          <div className="drag-drop-msg">
            <span>Drag & Drop files here<br />or <a>Browse</a> </span>
          </div>
        </Dropzone>
      </div>
    );
  }
}

FileDragDrop.propType = {
  params: PT.object
}

export default FileDragDrop;
