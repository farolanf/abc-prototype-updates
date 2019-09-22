import React, { Component } from 'react';
import PT from 'prop-types';
import { find, get } from 'lodash';
import './SLA.scss';

// SLA component
class SLA extends Component {
  constructor(props) {
    super(props);

    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.sortTable = this.sortTable.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);

    this.state = {
      sortOrder: "desc",
      sortableCol: "queryType",
      editableIndex: -1,
      editText: "",
      editUnit: ""
    }
  }

  // sortTable
  sortTable(sortableCol) {
    this.setState({
      sortOrder: (this.state.sortOrder === "desc" ? "asc" : "desc"),
      sortableCol: sortableCol
    })
  }

  // edit Setting
  editSetting(item, index) {
    this.setState({
      editableIndex: index,
      editText: item.number,
      editUnit: item.units
    })
  }

  // cancelEdit
  cancelEdit() {
    this.setState({
      editableIndex: -1,
      error: false
    })
  }

  // saveEdit
  saveEdit() {
    const { updateSettings } = this.props;
    const { editableIndex, editText, editUnit } = this.state;
    if (!editText) {
      this.setState({ error: true })
    } else {
      updateSettings(`[${editableIndex}].number`, editText);
      updateSettings(`[${editableIndex}].units`, editUnit);
      this.cancelEdit();
    }
  }


  //inputChangeHandler function
  inputChangeHandler(e) {
    const editText = e.target.value;
    if (editText && !/^[.\d]+$/.test(editText)) {
      return;
    }
    this.setState({ editText, error: false });
  }

  handleSelectChange(e) {
    this.setState({ editUnit: e.target.value });
  }

  getLabel(item) {
    const { lookup } = this.props;
    return get(find(lookup.exceptionTypes, ['id', item.exceptionTypeId]), 'value');
  }

  render() {
    const { lookup, setting, saveSettings } = this.props;
    const { error } = this.state;

    return (
      <div className="subpage single-query-form">
        <header className="page-header">
          <h2 className="page-title">SLA Settings</h2>
        </header>
        <div className="email-n-form">
          <div className="col-view">

            <div className="table-section">
              <div className="table-container">
                <div className="table table-mid table-sla">
                  <div className="thead">
                    <div className="tr">
                      <div className="th">
                        <span className={"thlbl  static"}>Query Type</span>
                      </div>
                      <div className="th">
                        <span className={"thlbl static "}>SLA</span>
                      </div>
                      <div className="th">
                        <span className="thlbl  static">Action</span>
                      </div>
                    </div>
                  </div>
                  <div className="tbody">
                    {
                      setting.map((item, i) => {
                        return i < setting.length / 2 && (
                          <div key={i} className={"tr " + (this.state.editableIndex === i ? 'editable' : '')}>
                            <div className="td">{this.getLabel(item)}</div>
                            <div className="td">{
                              this.state.editableIndex !== i
                                ? <span>{item.number} {item.units}</span>
                                : <div className="sla-edit">
                                  <input type="text" className={"input-ctrl sla-input " + (error ? 'error' : '')} value={this.state.editText} onChange={this.inputChangeHandler} />
                                  <select className="select-ctrl" value={this.state.editUnit}
                                    onChange={this.handleSelectChange}
                                  >
                                    {
                                      lookup && lookup.slaDuration && lookup.slaDuration.map((item, i) => {
                                        return (
                                          <option key={i} value={item.value}>{item.value}</option>
                                        )
                                      })
                                    }
                                  </select>
                                </div>
                            }
                            </div>
                            <div className="td">
                              {
                                this.state.editableIndex === i
                                  ? <div className="group"> <button className="btn" onClick={this.saveEdit}>Save</button>
                                    <button className="btn btn-clear" onClick={this.cancelEdit}>Cancel</button> </div>
                                  : <a className="lnk-edit" onClick={() => this.editSetting(item, i)}>Edit</a>
                              }
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
            {/* /.table-section */}

          </div>
          {/* /.col-view */}
          <div className="col-view">
            <div className="table-section">
              <div className="table-container">
                <div className="table table-mid table-sla">
                  <div className="thead">
                    <div className="tr">
                      <div className="th">
                        <span className={"thlbl static"}>Query Type</span>
                      </div>
                      <div className="th">
                        <span className={"thlbl static"}>SLA</span>
                      </div>
                      <div className="th">
                        <span className="thlbl static">Action</span>
                      </div>
                    </div>
                  </div>
                  <div className="tbody">
                    {
                      setting.map((item, i) => {
                        return i >= setting.length / 2 && (
                          <div key={i} className={"tr " + (this.state.editableIndex === i ? 'editable' : '')}>
                            <div className="td">{this.getLabel(item)}</div>
                            <div className="td">{
                              this.state.editableIndex !== i
                                ? <span>{item.number} {item.units}</span>
                                : <div className="sla-edit">
                                  <input type="text" className="input-ctrl sla-input" value={this.state.editText} onChange={this.inputChangeHandler} />
                                  <select className="select-ctrl" value={this.state.editUnit}
                                    onChange={this.handleSelectChange}
                                  >
                                    {
                                      lookup && lookup.slaDuration && lookup.slaDuration.map((item, i) => {
                                        return (
                                          <option key={i} value={item.value}>{item.value}</option>
                                        )
                                      })
                                    }
                                  </select>
                                </div>
                            }
                            </div>
                            <div className="td">
                              {
                                this.state.editableIndex === i
                                  ? <div className="group"> <button className="btn" onClick={this.saveEdit}>Save</button>
                                    <button className="btn btn-clear" onClick={this.cancelEdit}>Cancel</button> </div>
                                  : <a className="lnk-edit" onClick={() => this.editSetting(item, i)}>Edit</a>
                              }
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
            {/* /.table-section */}

          </div>
        </div>
        <div className="form-actions">
          {!(this.state.editableIndex >= 0) && (
            <a className="btn md" onClick={saveSettings}>Save Change</a>
          )}
        </div>
      </div>
    );
  }
}

SLA.propType = {
  params: PT.object
}

export default SLA;
