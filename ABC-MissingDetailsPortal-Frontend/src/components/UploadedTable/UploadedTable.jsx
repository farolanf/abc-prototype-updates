import React, { Component } from 'react';
import PT from 'prop-types';
import Pagination from "react-js-pagination";
import { orderBy, min, get } from 'lodash';
import utils from '../../utils';
import {columns} from '../../constants/queryFields';
import './UploadedTable.scss';

// UploadedTable component
class UploadedTable extends Component {
  constructor(props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    this.state = {
      sortOrder: 'desc',
      page: 1,
      perPage: 10,
      sortBy: 'id'
    }
  }

  handlePageChange(page) {
    this.setState({page});
  }

  // handles PageSize Change events
  handlePageSizeChange(event) {
    this.setState({
      perPage: event.target.value,
      page: 1
    });
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
    });
  }

  slicedQueries(){
    const {sortBy, sortOrder, page, perPage} = this.state;
    return orderBy(this.props.queries, sortBy, sortOrder).slice((page - 1) * perPage, perPage);
  }

  render() {
    const {queries} = this.props;
    const {sortBy, sortOrder, page, perPage} = this.state;
    const startIndex = (page - 1) * perPage + 1;
    const endIndex = min([page * perPage, queries.length]);

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
                this.slicedQueries().map((record, i) => (
                    <div key={i} className={"tr val-status " + record.status}>
                      {
                        columns.map((item, j) => {
                          return j === 0 && (
                            <div key={j} className={"td query-col " + (item.isDisabled ? 'disabled' : '')}>
                              <div className="query-val">
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
                  this.slicedQueries().map((record, i) => (
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
          {
            /*
            <div className="table table-rt has-line">
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
                        <a className="link-edit"> </a>
                        <a className="link-delete"> </a>
                      </div>
                    )
                  )
                }
              </div>
            </div>
            */
          }
          {/* table-rt */}
        </div>

        {/* pagination */}
        <div className="pagination-section">
          <div className="col-pagination">
            <span className="txt">Showing {Math.min(startIndex, queries.length)}-{endIndex} of {queries.length}</span>
            <span className="seperator">|</span>
            <div className="per-page"> <span className="lbl">View</span>
              <div className="select-wrap">
                <select className="select-ctrl" value={this.state.itemsCountPerPage} onChange={this.handlePageSizeChange}>
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
              totalItemsCount={queries.length}
              pageRangeDisplayed={5}
              onChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

UploadedTable.propType = {
  params: PT.object,
  filterActions: PT.object,
  closeModal: PT.func,
  showModal: PT.func,
  toggleReference: PT.func
}

export default UploadedTable;
