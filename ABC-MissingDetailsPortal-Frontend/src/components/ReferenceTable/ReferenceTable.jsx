import React, { Component } from 'react';
import PT from 'prop-types';
import Pagination from "react-js-pagination";
import {min, get} from 'lodash';
import utils from '../../utils';
import {columns} from '../../constants/queryFields';
import './ReferenceTable.scss';

// ReferenceTable component
class ReferenceTable extends Component {
  constructor(props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    this.state = {
      sortOrder: 'desc',
      sortBy: '',
      perPage: 10,
      page: 1
    }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData(){
    this.props.getQueries({
      ...this.state,
      sortBy: utils.querySortMap(this.state.sortBy),
    });
  }

  handlePageChange(page) {
    this.setState({page}, this.loadData);
  }

  // handles PageSize Change events
  handlePageSizeChange(event) {
    this.setState({
      perPage: event.target.value,
      page: 1
    }, this.loadData);
  }

  // function to implement table sorting
  sortTable(sortBy) {
    // unsortable columns
    if(['watchers', 'attachments'].indexOf(sortBy) >= 0){
      return;
    }
    let sortOrder = 'asc';
    if(this.state.sortBy === sortBy){
      sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
    }
    this.setState({
      sortOrder,
      sortBy
    }, this.loadData)
  }

  render() {
    const {dataset, toggleReference} = this.props;
    const records = dataset.results;
    const {sortBy, sortOrder, page, perPage} = this.state;
    const startIndex = (dataset.page - 1) * dataset.perPage + 1;
    const endIndex = min([dataset.page * dataset.perPage, dataset.total]);

    return (
      <div className="table-section">
        <div className="table-container">
          <div className="table table-lt">
            <div className="thead">
              <div className="tr">
                {
                  columns.map((item, i) => {
                    return i === 0 && (
                      <div key={i} className={"th query-col " + (item.isDisabled ? 'disabled' : '')}>
                        <span className={"thlbl " + sortOrder + ' ' + (sortBy === item.id ? ' sortable' : ' ')} onClick={() => this.sortTable(item.id)}>{item.label}</span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div className="tbody">
              {
                records.map((record, i) => (
                    <div key={i} className={"tr val-status " + record.status}>
                      {
                        columns.map((item, j) => {
                          return j === 0 && (
                            <div key={j} className={"td query-col " + (item.isDisabled ? 'disabled' : '')}>
                              <div className={"query-val " + ((record.status && (record.status.toLowerCase() === 'new' || record.status.toLowerCase() === 'open') ? 'selectable' : ''))}>
                                <span className="tdlbl">{record.queryId}</span>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  )
                )
              }
            </div>
          </div>
          {/* table-lt */}

          <div className="table table-query table-mid">
            <div className="table-mid-con">
              <div className="thead">
                <div className="tr">
                  {
                    columns.map((item, i) => {
                      return i > 0 && (
                        <div key={i} className={"th " + (item.isDisabled ? 'disabled' : '')}>
                          <span className={"thlbl " + sortOrder + ' ' + (sortBy === item.id ? ' sortable' : ' ')} onClick={() => this.sortTable(item.id)}>{item.label}</span>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
              <div className="tbody">
                {
                  records.map((record, i) => (
                      <div key={i} className="tr">
                        {
                          columns.map((item, i) => {
                            return i > 0 && (
                              <div key={i} className={"td " + (item.isDisabled ? 'disabled' : '')}>
                                {
                                  item.type === 'array'
                                  ? record[item.id] && record[item.id].map((arrayEl, j) => {
                                    return <div key={j}><a>{item.id ==='watchers' ? (get(arrayEl, 'firstName', '') + ' ' + get(arrayEl, 'lastName', '')) : arrayEl.name}</a>&nbsp;</div>
                                  })
                                  : item.format === 'link'
                                    ? <a>{record[item.id]}</a>
                                    : <span>{utils.formatField(record, item)} </span>
                                }
                              </div>
                            )
                          })

                        }
                      </div>
                    )
                  )
                }
              </div>
            </div>
          </div>
          {/* /.table-mid */}

          <div className="table table-rt">
            <div className="thead">
              <div className="tr">
                <div className="th">
                  <span className="thlbl static">Actions</span>
                </div>
              </div>
            </div>
            <div className="tbody">
              {
                records.map((record, i) => (
                    <div key={i + record.queryId} className="tr select-col">
                      <a className="btn btn-clear" onClick={()=>this.props.selectReference(record) } >Select</a>
                    </div>
                  )
                )
              }
            </div>
          </div>
          {/* table-rt */}
        </div>

        {/* pagination */}
        <div className="pagination-section">
          <div className="col-pagination">
            <span className="txt">Showing {Math.min(startIndex, dataset.total)}-{endIndex} of {dataset.total}</span>
            <span className="seperator">|</span>
            <div className="per-page"> <span className="lbl">View</span>
              <div className="select-wrap">
                <select className="select-ctrl" value={perPage} onChange={this.handlePageSizeChange}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
              </div>
              <span className="lbl">Per Page</span>
            </div>
          </div>
          <div className="col-pagination">
            <Pagination
              hideFirstLastPages
              activePage={page}
              itemsCountPerPage={perPage}
              totalItemsCount={dataset.total}
              pageRangeDisplayed={5}
              onChange={this.handlePageChange}
            />
          </div>
        </div>
        <br/>
        <br/>
        <button className="btn btn-clear" onClick={()=>toggleReference(false)}>Cancel</button>
      </div>
    );
  }
}

ReferenceTable.propType = {
  params: PT.object,
  filterActions: PT.object,
  closeModal: PT.func,
  showModal: PT.func,
  toggleReference: PT.func
}

export default ReferenceTable;
