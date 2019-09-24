import React, { Component } from 'react';
import PT from 'prop-types';
import { NavLink } from 'react-router-dom';
import { get, assign, cloneDeep, remove, isFunction, isEmpty, trim} from 'lodash';
import QueryTable from '../../components/QueryTable';
import FilterQueryTable from '../../components/FilterQueryTable';
import * as roles from '../../constants/roleTypes';
import permissions from '../../constants/permissions';
import * as statuses from '../../constants/queryStatusTypes';
import utils from '../../utils';
import './DashboardComponent.scss';

const tabs = [{
  key: 'all',
  title: 'All Statuses'
}, {
  key: statuses.NEW,
  title: 'New'
}, {
  key: statuses.OPEN,
  title: 'Open'
}, {
  key: statuses.CLOSED,
  title: 'Closed'
}, {
  key: statuses.REJECTED,
  title: 'Rejected'
}]

// DashboardComponent component
class DashboardComponent extends Component {
  constructor(props) {
    super(props);

    this.loadData = this.loadData.bind(this);
    this.getQueries = this.getQueries.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.showFilter = this.showFilter.bind(this);
    this.closeFilter = this.closeFilter.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.selectQuery = this.selectQuery.bind(this);
    this.clearSelectedQueries = this.clearSelectedQueries.bind(this);
    this.toggleWatchList = this.toggleWatchList.bind(this);
    this.toggleMyQueries = this.toggleMyQueries.bind(this);
    this.exportQueries = this.exportQueries.bind(this);
    this.unwatchQuery = this.unwatchQuery.bind(this);

    this.state = {
      isChecked: false,
      currentTab: 'all',
      modal: {},
      isFilterVisible: false,
      queriesSelected: [],
      filters: {},
      watchListOnly: false,
      myOnly: false
    }
    this.tables = {};
  }

  componentDidMount() {
    this.loadData();
  }

  loadData(page) {
    this.setState({
      queriesSelected: []
    });
    this.tables[this.state.currentTab].loadData(page);
  }

  getQueries(params) {
    const { currentTab, watchListOnly, filters, myOnly } = this.state;
    assign(params, {
      ...filters,
      statuses: currentTab === 'all' ? null : currentTab,
      watchList: watchListOnly,
      myOnly,
    });

    this.props.getQueries(currentTab, params);
  }

  /**
   * show/hide modal
   */
  showModal(name) {
    const obj = {
      modal: {}
    };
    obj.modal[name] = true;
    this.setState(obj);
    if (name === 'isReassignModal') {
      this.props.loadUsers('', [roles.DELIVERY_USER]);
    }
    document.querySelector('body').classList.add('hasmodal');
  }

  closeModal(name) {
    const obj = {
      modal: {}
    };
    obj.modal[name] = false;
    this.setState(obj);
    document.querySelector('body').classList.remove('hasmodal');

  }

  /**
   * show/hide Filter
   */
  showFilter() {
    this.setState({
      isFilterVisible: true
    });
  }

  closeFilter() {
    this.setState({
      isFilterVisible: false
    });
  }

  applyFilter(params) {
    const { queryId, sapContract, currencyId, exceptionTypeIds, countryId,
      dueDateStart, dueDateEnd, accountName, sdm, comment, ampId, requestor } = params;
    this.setState({
      filters: {
        queryId: trim(queryId),
        sapContract: trim(sapContract),
        currencyId,
        exceptionTypeIds,
        countryId,
        dueDateStart: dueDateStart,
        dueDateEnd: dueDateEnd,
        accountName: trim(accountName),
        sdm: trim(sdm),
        comment: trim(comment),
        ampId: trim(ampId),
        requestor: trim(requestor)
      }
    }, () => this.loadData(1));
  }

  // selectQueries
  selectQuery(isChecked, record) {
    const queriesSelected = cloneDeep(this.state.queriesSelected);
    if (isChecked) {
      queriesSelected.push(record);
    } else {
      remove(queriesSelected, ['id', record.id]);
    }
    this.setState({
      queriesSelected: queriesSelected
    });
  }

  clearSelectedQueries(cb) {
    this.setState({
      queriesSelected: []
    }, () => {
      if (isFunction(cb)) {
        cb();
      }
    });
  }

  activateTab(tab) {
    this.setState({
      currentTab: tab,
      keyword: ''
    }, this.loadData);
  }

  toggleWatchList() {
    this.setState({
      watchListOnly: !this.state.watchListOnly,
      myOnly: false
    }, () => this.loadData(1));
  }

  toggleMyQueries() {
    this.setState({
      myOnly: !this.state.myOnly,
      watchListOnly: false
    }, () => this.loadData(1))
  }

  exportQueries(){
    const {currentTab, watchListOnly, filters, myOnly} = this.state;
    if(isEmpty(this.props.queries[currentTab].results)){
      return;
    }
    const {page, perPage, sortBy, sortOrder} = this.tables[currentTab].state;
    const params = {
      ...filters,
      perPage,
      page,
      sortBy: utils.querySortMap(sortBy),
      sortOrder,
      statuses: currentTab === 'all' ? null : currentTab,
      watchList: watchListOnly,
      myOnly
    }

    this.props.exportQueries(params);
  }

  unwatchQuery(id){
    return this.props.unwatchQuery(id).then(resp=>{
      if(resp.ok && this.state.watchListOnly){
        this.loadData();
      }
    });
  }

  render() {
    const { user, meta, lookup, queries, users, loadUsers, watchQuery,
      reassignQueries, sendEmail, saveSendEmailDraft, updateWatchers, createComment, getQuery, changeRequestor, downloadAttachment} = this.props;
    const { modal, currentTab, watchListOnly, myOnly, queriesSelected } = this.state;
    const role = get(this.props, 'user.role')

    return (
      <div className="subpage">
        <header className="page-header">
          <h2 className="page-title">Dashboard</h2>
          <div className={"metavalues " + (user && user.role)}>
            <div className="metavalue tmq">
              <h4>{meta.numberOfTotalQueries}</h4>
              <div className="lbl-m">Total Missing Queries</div>
            </div>

            <div className="metavalue nmq">
              <h4>{meta.numberOfNewQueries}</h4>
              <div className="lbl-m">New Missing Queries</div>
            </div>

            <div className="metavalue omq">
              <h4>{meta.numberOfOpenQueries}</h4>
              <div className="lbl-m">Open Missing Queries</div>
            </div>

            <div className="metavalue cmq">
              <h4>{meta.numberOfClosedQueries}</h4>
              <div className="lbl-m">Closed Missing Queries</div>
            </div>

            <div className="metavalue rmq">
              <h4>{meta.numberOfRejectedQueries}</h4>
              <div className="lbl-m">Rejected Missing Queries</div>
            </div>

            <div className="addquery-section">
              <NavLink className="add-q add-ico" to="/singleQueryPage"> </NavLink>
              <NavLink className="add-q" to="/singleQueryPage">Single Query</NavLink>
              <NavLink className="add-q" to="/bulkQueries">Bulk Queries</NavLink>
            </div>
          </div>
        </header>

        <h3 className="title-alt">
          Missing Info Queries
        </h3>
        <div className="table-view-opts">
          {
            queriesSelected.length > 0
              ? (
                <ul className="list-seleced-opts">
                  <li>
                    <span className="selected-queries">
                      {queriesSelected.length} Queries Selected <span className="seprator">|</span> <a
                        onClick={this.clearSelectedQueries}
                      >Clear</a>
                    </span>
                  </li>
                  {
                    get(permissions, [role, 'queries', 'canRespond']) &&
                    (
                      <li>
                        <a className="btn" onClick={() => this.showModal('isRespondModal')}>
                          <span className="ico-respond">Respond</span>
                        </a>
                      </li>
                    )
                  }
                  {
                    get(permissions, [role, 'queries', 'canReject']) && (
                      <li>
                        <a className="btn" onClick={() => this.showModal('isRejectModal')}>
                          <span className="ico-reject">Reject</span>
                        </a>
                      </li>
                    )
                  }
                  {
                    get(permissions, [role, 'queries', 'canReassign']) && (
                      <li>
                        <a className="btn" onClick={() => this.showModal('isReassignModal')}>
                          <span className="ico-reassign">Re-assign</span>
                        </a>
                      </li>
                    )
                  }
                  {
                    get(permissions, [role, 'queries', 'canSendEmail']) && (
                      <li>
                        <a className="btn" onClick={() => this.showModal('isSendEmailModal')}>
                          <span className="ico-send-email">Send Email</span>
                        </a>
                      </li>
                    )
                  }
                  {
                    get(permissions, [role, 'queries', 'canEscalate']) && (
                      <li>
                        <a className="btn" onClick={() => this.showModal('isEscalateModal')}>
                          <span className="ico-escalate">Escalate</span>
                        </a>
                      </li>
                    )
                  }
                </ul>
              )
              : (
                <ul className="list">
                  {
                    tabs.map(tab => (
                      <li key={tab.key} className={currentTab === tab.key ? 'on' : ''}
                        onClick={() => this.activateTab(tab.key)} >{tab.title}</li>
                    ))
                  }
                </ul>
              )
          }

          <div className={"query-btns " + user.role}>
            {
              (get(this.props, 'user.role') === roles.CONTRACT_ADMIN_USER || 
                get(this.props, 'user.role') === roles.DELIVERY_USER) &&
              <button className={`btn ${myOnly ? '' : 'btn-clear'} off-management_user`} onClick={this.toggleMyQueries}>
                My queries
              </button>
            }
            <button className={`btn ${watchListOnly ? '' : 'btn-clear'} off-management_user`} onClick={this.toggleWatchList}>
              Watchlist
            </button>
            <button className={`btn btn-clear ${isEmpty(queries[currentTab].results) ? 'btn-disabled' : ''}`} onClick={this.exportQueries}>
              <span className="ico-excel" >Export to .xlsx</span>
            </button>
            <button className="btn btn-clear" onClick={() => this.showModal('isManageColModal')}>
              <span className="ico-manage-cols">Manage Columns</span>
            </button>
            <button className="btn" onClick={this.showFilter}>
              <span className="ico-filter" >Filter</span>
            </button>
          </div>
        </div>

        <FilterQueryTable
          showFilter={this.showFilter}
          closeFilter={this.closeFilter}
          applyFilter={this.applyFilter}
          lookup={lookup}
          className={this.state.isFilterVisible ? 'open' : ''}
        />

        {
          tabs.map(tab => (
            <QueryTable
              key={tab.key}
              className={currentTab !== tab.key ? 'hidden' : ''}
              ref={e => { this.tables[tab.key] = e }}
              getQueries={this.getQueries}
              modal={modal}
              dataset={queries[tab.key]}
              user={user}
              lookup={lookup}
              closeModal={this.closeModal}
              showModal={this.showModal}
              watchQuery={watchQuery}
              unwatchQuery={this.unwatchQuery}
              selectQuery={this.selectQuery}
              clearSelectedQueries={this.clearSelectedQueries}
              queriesSelected={queriesSelected}
              users={users}
              loadUsers={loadUsers}
              reassignQueries={reassignQueries}
              sendEmail={sendEmail}
              saveSendEmailDraft={saveSendEmailDraft}
              updateWatchers={updateWatchers}
              createComment={createComment}
              getQuery={getQuery}
              changeRequestor={changeRequestor}
              downloadAttachment={downloadAttachment}
            />
          ))
        }
        {/* /.query-table */}
      </div>
    );
  }
}

DashboardComponent.propType = {
  params: PT.object,
  lookup: PT.object
}

export default DashboardComponent;
