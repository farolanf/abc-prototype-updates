import React, { Component } from 'react';
import PT from 'prop-types';
import Pagination from "react-js-pagination";
import {min} from 'lodash';
import * as statuses from '../../constants/statusTypes';
import './UsersManagementTable.scss';

const columns = [
  {
    label: "Username",
    id: "employeeId"
  },
  {
    label: "Role",
    id: "role"
  },
  {
    label: "Email Address",
    id: "email"
  },
  {
    label: "Status",
    id: "status"
  },
  {
    label: "Team Name",
    id: "teamName"
  },
  {
    label: "Added 0n",
    id: "createdOn"
  }
]

// UsersManagementTable component
class UsersManagementTable extends Component {
  constructor(props) {
    super(props);

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);

    this.state = {
      sortBy: null,
      sortOrder: 'asc',
      page: 1,
      perPage: 10,
    }
  }

  loadData(page){
    if(page){
      this.setState({page});
    }
    this.props.getUsers({
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder,
      page: page || this.state.page,
      perPage: this.state.perPage
    });
  }

  handlePageChange(pageNumber) {
    this.setState({ page: pageNumber }, this.loadData);
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
    const {dataset, className, blockUser, showModal, selectUser} = this.props;
    const {sortBy, sortOrder, page, perPage} = this.state;
    const startIndex = (dataset.page - 1) * dataset.perPage + 1;
    const endIndex = min([dataset.page * dataset.perPage, dataset.total]);

    return (
      <div className={`table-section ${className}`}>
        <div className="table-container">
          <div className="table table-user-mgmt table-mid">
            <div className="table-mid-con auto">
              <div className="thead">
                <div className="tr">
                  {
                    columns.map((item, i) => {
                      return (
                        <div key={i} className={"th " + (item.isDisabled ? 'disabled' : '')}>
                          <span className={'thlbl sortable ' + (sortBy === item.id ? sortOrder : '')} onClick={() => this.sortTable(item.id)}>{item.label}</span>
                        </div>
                      )
                    })
                  }
                  <div className="th actions-col">
                    <span className="thlbl static">Actions</span>
                  </div>
                </div>
              </div>
              <div className="tbody">
                {
                  dataset.results.map((record, i) =>
                    (
                      <div key={i} className={"tr " + (record.status===statuses.BLOCKED ? 'blocked' : '')}>
                        {
                          columns.map((item, j) => {
                            return j === 0
                              ? (
                                <div key={'i-' + j} className={"td user-col " + (record['status']) + (item.isDisabled ? '  disabled ' : '')}>
                                  <div className={"query-val " + ((record.status && (record.status.toLowerCase() === 'new' || record.status.toLowerCase() === 'open') ? 'selectable' : ''))}>
                                    <span className="tdlbl">{record[item.id]}</span>
                                  </div>
                                </div>
                              )
                              : (
                                <div key={'i-' + j} className={"td " + (item.isDisabled ? 'disabled' : '')}>
                                  {
                                    item.type === 'link'
                                      ? <a className="tdlbl ">{record[item.id]}</a>
                                      : <span className="tdlbl ">{record[item.id]}</span>
                                  }
                                </div>
                              )
                          })
                        }

                        <div className="td actions-col">
                          <a className="ico-link ico-block" onClick={() => blockUser(record)}>Block</a>
                          <a className="ico-link ico-cog" onClick={() => {selectUser(record); showModal('isChangeModal');}}>Change Role</a>
                          <a className="ico-link ico-trash" onClick={() => {selectUser(record); showModal('isRemoveModal');}}>Remove</a>
                        </div>

                      </div>
                    )
                  )
                }
              </div>
            </div>
          </div>
          {/* /.table-mid */}

        </div>

        {/* pagination */}
        <div className="pagination-section">
          <div className="col-pagination">
            <span className="txt">Showing {Math.min(startIndex, dataset.total) || '...'}-{endIndex} of {dataset.total}</span>
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



      </div>
    );
  }
}

UsersManagementTable.propType = {
  showModal: PT.func
}

export default UsersManagementTable;
