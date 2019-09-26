import React, { Component } from 'react';
import PT from 'prop-types';
import { cloneDeep, min, get, map, findIndex, trim, omitBy, toArray, find } from 'lodash';
import * as moment from 'moment';
import DatePicker from 'react-datepicker';
import Pagination from "react-js-pagination";
import RadioCtrl from '../../components/RadioCtrl';
import FileDragDrop from '../../components/FileDragDrop';
import UserSelector from '../../components/UserSelector';
import * as roles from '../../constants/roleTypes';
import { DATE_FORMAT, DATETIME_FORMAT } from '../../config';
import * as statuses from '../../constants/queryStatusTypes';
import { columns, fields } from '../../constants/queryFields';
import utils from '../../utils';
import './QueryTable.scss';

// log history mock up
const logHistory = {
  headers: [
    { label: 'Time Stamp' },
    { label: 'Query ID' },
    { label: 'Action' },
    { label: 'Field' },
    { label: 'Modified by' }
  ],
  data: [
    { timestamp: '09/16/2019, 09:30AM', queryId: 123456, action: 'Edit', field: 'Billing end data; account type; rework reason; date& timeclosed', modifiedBy: 'John Smith' },
    { timestamp: '09/16/2019, 09:30AM', queryId: 123456, action: 'Edit', field: 'Billing end data; account type; rework reason; date& timeclosed', modifiedBy: 'John Smith' }
  ]
}

const QueryDetails = ({ query }) => {
  return (
    <ul className="more-details">
      {
        fields.map(field => (
          <li key={field.id} className="details-el">
            <div>{field.label}:</div>
            {
              field.type === 'array'
                ? query[field.id] && query[field.id].map((arrayEl, j) => (<div key={j}><span>{field.id === 'watchers' ? (get(arrayEl, 'firstName', '') + ' ' + get(arrayEl, 'lastName', '')) : arrayEl.name}</span>&nbsp;</div>
                )) :
                <div className="details-value">{utils.formatField(query, field)}</div>
            }
          </li>
        ))
      }
    </ul>
  )
}

// QueryTable component: This component contains query table & it's options
class QueryTable extends Component {
  constructor(props) {
    super(props);

    this.loadData = this.loadData.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.toggleColView = this.toggleColView.bind(this);
    this.applyColView = this.applyColView.bind(this);
    this.cancelColView = this.cancelColView.bind(this);
    this.showQueryDetails = this.showQueryDetails.bind(this);
    this.toggleQueryInfoView = this.toggleQueryInfoView.bind(this);
    this.toggleLogHistoryView = this.toggleLogHistoryView.bind(this);
    this.isQuerySelected = this.isQuerySelected.bind(this);
    this.reassignSDM = this.reassignSDM.bind(this);
    this.showMore = this.showMore.bind(this);
    this.expandRow = this.expandRow.bind(this);
    this.toggleWatcher = this.toggleWatcher.bind(this);
    this.toggleReassignPopup = this.toggleReassignPopup.bind(this);
    this.selectSingleQuery = this.selectSingleQuery.bind(this);
    this.toggleQueryRow = this.toggleQueryRow.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.reassignQueries = this.reassignQueries.bind(this);
    this.addWatcher = this.addWatcher.bind(this);
    this.onAttachmentsChange = this.onAttachmentsChange.bind(this);
    this.closeQueries = this.closeQueries.bind(this);
    this.rejectQueries = this.rejectQueries.bind(this);
    this.showRejectReason = this.showRejectReason.bind(this);
    this.toggleRequestor = this.toggleRequestor.bind(this);
    this.handleChangeExportLogHistory = this.handleChangeExportLogHistory.bind(this);

    this.state = {
      sortOrder: 'desc',
      sortBy: '',
      page: 1,
      perPage: 10,
      queryRecords: [],
      columnsFinal: cloneDeep(columns),
      columnsEdit: cloneDeep(columns),
      attachments: [],
      queryExpanded: null,
      reassignedSdm: null,
      expandedRecordIds: [],
      watcherHistory: [],
      selectedQuery: null,
      reassignSdmInput: '',
      commentInput: '',
      emailTo: '',
      emailSubject: '',
      emailMessage: '',
      errors: {},
      rejectReason: 'Incomplete details',
      missingInfoActionOwner: '',
      exportLogHistory: false,
      exportShowPreview: false,
      previewSheet: 'sheet1',
      showMessage: false,
      messageTitle: '',
      message: '',
      isEditingQuery: false,
      updatedFields: {}
    }
  }

  componentDidUpdate(prevProps) {
    const fullName = `${get(this.props, 'user.firstName') || ''} ${get(this.props, 'user.lastName') || ''}`
    const queryIds = map(this.getSelectedQueries(), 'id')

    // init states on showing modals
    if (get(this.props, 'modal.isSendEmailModal') && !get(prevProps, 'modal.isSendEmailModal')) {
      this.setState({
        emailTo: 'Missing Info Owner; Missing Info Action Owner',
        emailSubject: `Priority Notification from ${fullName}`,
        emailMessage: `\nDear User,\n\nThe below items were reviewed by ${fullName} and were mapped as priority in Front End Portal. Below the message sent by ${fullName}\n\nQuery ${queryIds.join(';')}\n\nHello,\nPlease prioritize this items as it has a big amount impact.\n\nRegards`
      })
    } else if (get(this.props, 'modal.isEscalateModal') && !get(prevProps, 'modal.isEscalateModal')) {
      this.setState({
        emailTo: 'Missing Info Owner; Missing Info Action Owner',
        emailSubject: `Escalation Notification from ${fullName}`,
        emailMessage: `\nDear User,\n\nThe below items were reviewed by ${fullName} and were mapped as priority in Front End Portal. Below the message sent by ${fullName}\n\nQuery ${queryIds.join(';')}\n\nHello,\nPlease prioritize this items as it has a big amount impact.\n\nRegards`
      })
    }
  }

  loadData(page) {
    if (page) {
      this.setState({ page });
    }
    this.props.getQueries({
      sortBy: utils.querySortMap(this.state.sortBy),
      sortOrder: this.state.sortOrder,
      page: page || this.state.page,
      perPage: this.state.perPage
    });
  }

  // showQueryDetails
  showQueryDetails(item) {
    this.props.getQuery(item.id);
    this.setState({
      selectedQuery: item
    }, () => {
      this.showModal('isQueryDetailsModal');
    });
  }

  // showMore
  showMore(e) {
    e.stopPropagation();
    const el = e.target;
    const m = document.querySelectorAll('.more');
    for (let i = 0; i < m.length; i++) {
      const nel = m[i];
      nel.classList.remove('open');
    }
    el.classList.add('open');

    const b = document.querySelector('body');
    b.addEventListener('click', function () {
      const m = document.querySelectorAll('.more');
      for (let j = 0; j < m.length; j++) {
        const nel = m[j];
        nel.classList.remove('open');
      }
    })
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

  // toggleQueryInfoView
  toggleQueryInfoView() {
    this.setState({
      isQueryInfoCollapsed: !this.state.isQueryInfoCollapsed
    })
  }

  toggleLogHistoryView() {
    this.setState({
      isLogHistoryCollapsed: !this.state.isLogHistoryCollapsed
    })
  }

  // function to implement table sorting
  sortTable(sortBy) {
    // unsortable columns
    if (['watchers', 'attachments'].indexOf(sortBy) >= 0) {
      return;
    }
    let sortOrder = 'asc';
    if (this.state.sortBy === sortBy) {
      sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
    }
    this.setState({
      sortOrder,
      sortBy
    }, this.loadData)
  }

  toggleColView(item) {
    item.isDisabled = !item.isDisabled;
    this.setState({
      columnsEdit: cloneDeep(this.state.columnsEdit)
    });
  }

  // applyColView
  applyColView() {
    this.setState({
      columnsFinal: cloneDeep(this.state.columnsEdit)
    });
    this.props.closeModal('isManageColModal');
    // debugger;
    const enabledList = omitBy(this.state.columnsEdit, (item)=>{return item.isDisabled;});
    if (toArray(enabledList).length < 11) {
      document.querySelector('.table-mid').classList.add('alt');
    } else {
      document.querySelector('.table-mid').classList.remove('alt');
    }
  }

  cancelColView() {
    this.setState({
      columnsEdit: cloneDeep(this.state.columnsFinal)
    });
    this.props.closeModal('isManageColModal');
  }

  // selectSingleQuery
  selectSingleQuery(isChecked, record) {
    this.props.clearSelectedQueries(() => this.props.selectQuery(isChecked, record));
  }

  getSelectedQueries(){
    const {queriesSelected} = this.props;
    if(queriesSelected && queriesSelected.length){
      return queriesSelected;
    }else if(this.state.selectedQuery){
      return [this.state.selectedQuery];
    }else{
      return [];
    }
  }

  // respondAction
  respondAction(record) {
    this.setState({
      selectedQuery: record
    }, ()=>{
      this.showModal('isRespondModal');
    });
  }

  // rejectAction
  rejectAction(record) {
    this.setState({
      selectedQuery: record
    }, ()=>{
      this.showModal('isRejectModal');
    });
  }

  // reassignAction
  reassignAction(record) {
    this.setState({
      selectedQuery: record
    }, ()=>{
      this.showModal('isReassignModal');
    });
  }

  // isQuerySelected
  isQuerySelected(record) {
    return findIndex(this.props.queriesSelected, ['id', record.id]) >= 0;
  }

  // reassignSdm
  reassignSDM(newSdm) {
    this.setState({
      reassignedSdm: newSdm
    })
  }

  // expandRow
  expandRow(record) {
    const qid = record.id;
    const qIdx = this.state.expandedRecordIds.indexOf(qid);
    const isExpanded = qIdx > -1;
    if (isExpanded) {
      const newERI = cloneDeep(this.state.expandedRecordIds);
      newERI.splice(qIdx, 1);
      this.setState({
        expandedRecordIds: newERI
      })
    } else {
      const expandedRecordIds = this.state.expandedRecordIds;
      expandedRecordIds.push(qid);
      this.setState({
        expandedRecordIds
      })
    }
  }

  // isExpandedRow: toggle the expanded state
  isExpandedRow(queryId) {
    return this.state.expandedRecordIds.indexOf(queryId) > -1;
  }

  // toggleWatcher
  toggleWatcher(isVisible) {
    this.setState({
      isWatcherPopVisible: isVisible
    });
  }

  toggleRequestor(isVisible) {
    this.setState({
      isRequestorPopVisible: isVisible
    });
  }

  // toggleReassignPopup
  toggleReassignPopup(isVisible) {
    this.setState({
      isReassignSDM: isVisible
    })
  }

  toggleQueryRow(query) {
    if (this.state.queryExpanded && this.state.queryExpanded.id === query.id) {
      this.setState({ queryExpanded: null });
    } else {
      this.setState({
        queryExpanded: query
      })
    }
  }

  isWatched(query) {
    return map(query.watchers || [], 'id').indexOf(this.props.user.id) >= 0;
  }

  toggleWatch(query) {
    const { watchQuery, unwatchQuery } = this.props;
    if (this.isWatched(query)) {
      unwatchQuery(query.id);
    } else {
      watchQuery(query.id);
    }
  }

  isEditable(query) {
    return (this.props.user.role === roles.CONTRACT_ADMIN_USER || query.sdmId === this.props.user.id) && (query.status === statuses.NEW || query.status === statuses.OPEN);
  }

  isAssignable(query) {
    return query.status === statuses.NEW || query.status === statuses.OPEN;
  }

  showModal(type) {
    if (type !== 'isRejectReasonModal') {
      this.setState({
        attachments: [],
        commentInput: ''
      });
    }
    this.props.showModal(type);
    document.querySelector('body').classList.add('hasmodal');

  }

  closeModal(type) {
    if (type === 'isReassignModal') {
      this.setState({
        reassignedSdm: null,
        reassignSdmInput: ''
      });
    }
    if(type === 'isRejectModal' || type ===  'isRespondModal'){
      this.setState({
        attachments: [],
        commentInput: ''
      });
    }
    if(type === 'isQueryDetailsModal'){
      this.setState({
        isRequestorPopVisible: false,
        isWatcherPopVisible: false,
        isReassignSDM: false,
      });
    }
    this.setState({
      isEditingQuery: false,
      queryExpanded: null,
      errors: {}
    });
    this.props.closeModal(type);
    document.querySelector('body').classList.remove('hasmodal');

  }

  handleChange(key, value) {
    this.setState({
      [key]: value
    });
    if (key === 'commentInput' && value) {
      this.setState({
        errors: {
          ...this.state.errors,
          commentInput: false
        }
      })
    }
    if (key === 'reassignSdmInput') {
      this.props.loadUsers(value, [roles.DELIVERY_USER]);
    }
  }

  handleChangeField(field, value) {
    this.setState(prevState => ({
      updatedFields: {
        ...prevState.updatedFields,
        [field]: value
      }
    }))
  }

  enterQueryEditing() {
    this.setState({ isEditingQuery: true, updatedFields: {} })
  }

  exitQueryEditing(submit) {
    const { user } = this.props
    const { selectedQuery, updatedFields } = this.state
    if (submit) {
      this.props.updateQuery(selectedQuery.id, updatedFields, user.id);
    }
    this.setState({ isEditingQuery: false, updatedFields: {} })
  }

  reassignQueries(queryIds, userId) {
    this.props.reassignQueries(queryIds, userId).then(resp => {
      if (resp.ok) {
        this.props.clearSelectedQueries();
        this.loadData();
        this.toggleReassignPopup(false);
        if (this.props.modal.isReassignModal) {
          this.closeModal('isReassignModal');
        }
      }
    })
  }

  sendEmail(queryIds, userId) {
    this.props.sendEmail(queryIds, userId).then(resp => {
      if (resp.ok) {
        if (get(this.props, 'modal.isSendEmailModal')) {
          this.closeModal('isSendEmailModal')
        }
      }
    })
  }

  sendEscalationEmail(queryIds, userId) {
    this.props.sendEscalationEmail(queryIds, userId).then(resp => {
      if (resp.ok) {
        if (get(this.props, 'modal.isEscalateModal')) {
          this.closeModal('isEscalateModal')
        }
      }
    })
  }

  massEdit(massEditProps, queryIds, userId) {
    this.props.massEdit(massEditProps, queryIds, userId).then(resp => {
      if (resp.ok) {
        if (get(this.props, 'modal.isMassEditModal')) {
          this.closeModal('isMassEditModal')
        }
      }
    })
  }

  addWatcher(query, user) {
    this.props.updateWatchers(query.id, map(query.watchers, 'id').concat([user.id])).then(resp => {
      if (resp.ok) {
        this.toggleWatcher(false);
      }
    })
  }

  changeRequestor(query, user) {
    this.props.changeRequestor(query.id, user.id).then(resp => {
      if (resp.ok) {
        this.toggleRequestor(false);
        this.closeModal('isQueryDetailsModal');
        this.loadData();
      }
    })
  }

  onAttachmentsChange(attachments) {
    this.setState({ attachments });
  }

  closeQueries(queries) {
    const { commentInput, attachments } = this.state;
    const { createComment } = this.props;
    if (trim(commentInput)) {
      createComment({
        text: commentInput,
        files: attachments,
        status: statuses.CLOSED,
        queryIds: map(queries, 'id')
      }).then(resp => {
        if (resp.ok) {
          this.props.clearSelectedQueries();
          this.closeModal();
        }
      });
    } else {
      this.setState({
        errors: {
          commentInput: true
        }
      })
    }
  }

  rejectQueries(queries) {
    const { commentInput, attachments, rejectReason } = this.state;
    const { createComment } = this.props;
    if (trim(commentInput)) {
      createComment({
        text: commentInput,
        files: attachments,
        status: statuses.REJECTED,
        rejectReason,
        queryIds: map(queries, 'id')
      }).then(resp => {
        if (resp.ok) {
          this.props.clearSelectedQueries();
          this.closeModal();
        }
      });
    } else {
      this.setState({
        errors: {
          commentInput: true
        }
      })
    }
  }

  showRejectReason() {
    if (trim(this.state.commentInput)) {
      this.closeModal();
      this.showModal('isRejectReasonModal')
    } else {
      this.setState({
        errors: {
          commentInput: true
        }
      });
    }
  }

  isDetailsItemDisable(id){
    return get(find(this.state.columnsFinal, ['id', id]), 'isDisabled', false);
  }

  shouldRenderFieldValue(item, role, editing) {
    return !this.shouldRenderFieldControl(item, role, editing);
  }

  shouldRenderFieldControl(item, role, editing) {
    return editing && Array.isArray(item.editableBy) && item.editableBy.includes(role);
  }

  handleChangeExportLogHistory(val){
    this.setState(prevState => ({
      exportLogHistory: val,
      previewSheet: !val ? 'sheet1' : prevState.previewSheet
    }))
  }

  renderFieldSelect(item, selectedQuery, options){
    return (
      <select className="select-ctrl" value={this.state.updatedFields[item.id] || selectedQuery[item.id]} onChange={e => this.handleChangeField(item.id, e.target.value)}>
        {options.map((opt, i) => <option key={i} value={opt.value}>{opt.value}</option>)}
      </select>
    )
  }

  render() {
    const { dataset, className, lookup, modal, user, selectQuery, users, loadUsers, downloadAttachment, exportQueries } = this.props;
    const { columnsFinal, columnsEdit, sortBy, sortOrder, page, perPage, selectedQuery, queryExpanded,
      reassignedSdm, reassignSdmInput, commentInput, errors, rejectReason, missingInfoActionOwner, emailTo, emailSubject, emailMessage, exportLogHistory, exportShowPreview, previewSheet, showMessage, messageTitle, message, isEditingQuery } = this.state;
    const startIndex = (dataset.page - 1) * dataset.perPage + 1;
    const endIndex = min([dataset.page * dataset.perPage, dataset.total]);

    const showEscalationField = !!dataset.results.find(q => !!q.escalation)

    return (
      <div className={`table-section ${className}`}>
        <div className="table-container">
          <div className="table table-lt">
            <div className="thead">
              <div className="tr">
                {
                  columnsFinal.map((item, i) => {
                    return !item.isDetails && i === 0 && (
                      <div key={i} className={"th align-center query-col " + (item.isDisabled ? 'disabled' : '')}>
                        <span className={"thlbl " + sortOrder + ' ' + (sortBy === item.id ? ' sortable' : ' ')} onClick={() => this.sortTable(item.id)}>{item.label}</span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div className="tbody">
              {
                dataset.results.map((record, i) => (
                  <div key={i} className={"tr val-status " + record.status + " " + (this.isExpandedRow(record.id) ? 'expanded' : '')}>
                    {
                      columnsFinal.map((item, j) => {
                        return !item.isDetails && j === 0 && (
                          <div key={j} className={"td query-col " + (item.isDisabled ? 'disabled' : '')}>
                            <div className={"query-val " + (this.isEditable(record) ? 'selectable' : '')}>
                              <RadioCtrl params={{ label: "", isChecked: this.isQuerySelected(record) }} onChange={(isChecked) => selectQuery(isChecked, record)} />
                              <span className="tdlbl"><a onClick={() => this.showQueryDetails(record)}>{record.id}</a>
                              </span>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                ))
              }
            </div>
          </div>
          {/* table-lt */}

          <div className="table table-query table-mid">
            <div className="table-mid-con">
              <div className="thead">
                <div className="tr">
                  {
                    columnsFinal.map((item, i) => {
                      return !item.isDetails && i > 0 && (item.id !== 'escalation' || (item.id === 'escalation' && showEscalationField)) && (
                        <div key={i} className={"th " + (item.isDisabled ? 'disabled' : '')}>
                          <span className={"thlbl " + this.state.sortOrder + ' ' + (this.state.sortBy === item.id ? ' sortable' : ' ')} onClick={() => this.sortTable(item.id)}>{item.label}</span>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
              <div className="tbody">
                {
                  dataset.results.map((record, i) => (
                    <div key={i} className={"tr expandable " + record.status + " " + (this.isExpandedRow(record.id) ? 'expanded' : '')}>
                      <div className="norm tr-inner">
                        {
                          columnsFinal.map((item, i) => {
                            return !item.isDetails && i > 0 && (item.id !== 'escalation' || (item.id === 'escalation' && showEscalationField)) &&
                            (
                              <div key={i} className={"td " + (item.isDisabled ? 'disabled' : '')}>
                                {
                                  item.type === 'array' && record[item.id] && record[item.id].map((arrayEl, j) => {
                                    return j === 0 && <span key={j}>
                                      <a>{item.id === 'watchers' ? (get(arrayEl, 'firstName', '') + ' ' + get(arrayEl, 'lastName', '')) : arrayEl.name} {record[item.id].length > 1 ? `& ${record[item.id].length - 1} more` : ''} </a>&nbsp;
                                      </span>
                                  })
                                }
                                {
                                  item.type === 'date' && record[item.id] && <span>{moment(record[item.id]).format(DATE_FORMAT)}</span>
                                }
                                {
                                  item.type === 'datetime' && record[item.id] && <span>{moment(record[item.id]).format(DATETIME_FORMAT)}</span>
                                }
                                {
                                  !item.type && item.format === 'link' && <a>{record[item.id]}</a>
                                }
                                {
                                  item.type === 'escalation' &&
                                  !!record[item.id] &&
                                  <a onClick={() => this.setState({
                                    showMessage: true,
                                    messageTitle: 'Escalation Message',
                                    message: record[item.id]
                                  })} className={`dark-link ${
                                    /** FIXME: simulate seen status **/Number(record.id) === 98 ? 'seen' : ''}`}><span className="blue-dot" />Escalation Message</a>
                                }
                                {
                                  !item.type && !item.format && <span>{record[item.id]}</span>
                                }
                              </div>
                            )
                          })

                        }
                      </div>
                      <div className="on-expand tr-inner">
                        <div className="tr-inner-details">
                          <div className={"group " + (this.isDetailsItemDisable('billingIndex') ? 'disable' : '')}>
                            <h4>Billing Index</h4>
                            <div className="val">{record.billingIndex}</div>
                          </div>

                          <div className={"group " + (this.isDetailsItemDisable('billingStartDate') ? 'disable' : '')}>
                            <h4>Billing Start Date</h4>
                            <div className="val">{record.billingStartDate ? moment(record.billingStartDate).format(DATE_FORMAT) : 'N/A'}</div>
                          </div>

                          <div className={"group " + (this.isDetailsItemDisable('billingEndDate') ? 'disable' : '')}>
                            <h4>Billing End Date</h4>
                            <div className="val">{record.billingEndDate ? moment(record.billingEndDate).format(DATE_FORMAT) : 'N/A'}</div>
                          </div>

                          <div className={"group " + (this.isDetailsItemDisable('valueToBeBilled') ? 'disable' : '')}>
                            <h4>Value to be billed</h4>
                            <div className="val">{record.valueToBeBilled}</div>
                          </div>

                          <div className={"group " + (this.isDetailsItemDisable('currencyName') ? 'disable' : '')}>
                            <h4>Currency</h4>
                            <div className="val">{record.currencyName}</div>
                          </div>

                          <div className={"group " + (this.isDetailsItemDisable('closedDate') ? 'disable' : '')}>
                            <h4>Date & Time Closed</h4>
                            <div className="val">{record.closedDate ? moment(record.closedDate).format(DATETIME_FORMAT) : 'N/A'}</div>
                          </div>

                          <div className="group comment-group">
                            <h4>SDM Comments</h4>
                            <div className="val">{record.sdmComments.map(c => c.text).join('\n')}</div>
                          </div>

                          {
                            record.status === statuses.REJECTED &&
                            <div className="group comment-group">
                              <h4>Reject Reason</h4>
                              <div className="val">{record.sdmComments.map(c => c.rejectReason).join('\n')}</div>
                            </div>
                          }

                          <div className="group">
                            <h4>Attachments</h4>
                            <div className="val">{
                              record.attachments && record.attachments.map((attachment, idx) => {
                                return (
                                  <div key={idx} className="attachments">
                                    <div className={"file " + attachment.format}><a>{attachment.name}</a></div>
                                  </div>
                                )
                              })
                            }</div>
                          </div>

                          <div className="group">
                            <h4>Rework Reason</h4>
                            <div className="val">{record.reworkReason}</div>
                          </div>

                          <div className="group">
                            <h4>Requestor</h4>
                            <div className="val"><a>{record.requestorName}</a></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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
                dataset.results.map((record, i) => (
                  <div key={record.id} className={"tr " + record.status + " " + (this.isExpandedRow(record.id) ? 'expanded' : '')}>
                    <div className="td align-center action-col">
                      <div className={`more ${this.isAssignable(record) ? '' : 'invisiable'}`} onClick={(e) => { this.showMore(e) }}>
                        <ul className="popup-more-actions">
                          {this.isEditable(record) && user.role === roles.DELIVERY_USER && <li className="res" onClick={() => this.respondAction(record)}>Respond</li>}
                          {this.isEditable(record) && user.role === roles.DELIVERY_USER && <li className="rej" onClick={() => this.rejectAction(record)}>Reject</li>}
                          {this.isAssignable(record) && <li className="rea" onClick={() => this.reassignAction(record)}>Re-assign</li>}
                          {user.role !== roles.MANAGEMENT_USER && <li className="a2w" onClick={() => this.toggleWatch(record)}>{this.isWatched(record) ? 'Unwatch' : 'Add to Watch List'}</li>}
                        </ul>
                      </div>
                      <a className="toogle-expand" onClick={() => this.expandRow(record)}> </a>
                    </div>
                  </div>
                ))
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

        {
          modal && modal.isManageColModal && <div className="modal-wrap">
            <div className="modal modal-cols">
              <header>
                <h2 className="modal-title">Manage Columns</h2>
                <a className="close-modal" onClick={this.cancelColView}> </a>
              </header>
              <div className="modal-body layout-centered">
                <ul className="col-view manage-col-view">
                  {
                    columnsEdit.map((item, i) => {
                      return i > 0 && i < columnsEdit.length / 2 + 1 && (
                        <li key={i} onClick={() => this.toggleColView(item)}>
                          <span className="col">{item.label}</span>
                          <span className={"toggle-button " + (item.isDisabled ? 'off' : 'on')}> </span>
                        </li>
                      )
                    })
                  }
                </ul>
                <ul className="col-view manage-col-view">
                  {
                    columnsEdit.map((item, i) => {
                      return i >= columnsEdit.length / 2 + 1 && (
                        <li key={i} onClick={() => this.toggleColView(item)}>
                          <span className="col">{item.label}</span>
                          <span className={"toggle-button " + (item.isDisabled ? 'off' : 'on')}> </span>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
              <footer className="modal-footer modal-actions">
                <a className="btn" onClick={this.applyColView}>Apply</a>
                <a className="btn btn-clear" onClick={this.cancelColView}>Cancel</a>
              </footer>
            </div>
          </div>
        }

        {
          modal && modal.isQueryDetailsModal && selectedQuery && <div className="modal-wrap">
            <div className="modal modal-cols">
              <header>
                <h2 className="modal-title">Query Details</h2>
                <a className="close-modal" onClick={() => this.closeModal('isQueryDetailsModal')}> </a>
              </header>
              <div className="modal-content">
                <div className="query-info">
                  <header className="query-header">
                    <h3 className={"query-info-h " + (this.state.isQueryInfoCollapsed ? 'alt' : '')}
                      onClick={this.toggleQueryInfoView}
                    >Query Info <i></i></h3>
                    {
                      isEditingQuery
                      ?
                      <div className="opts">
                        <a className="btn w-md" onClick={() => this.exitQueryEditing(true)}>
                          <span className="btn-lbl">Save</span>
                        </a>
                        <a className="btn btn-clear w-md" onClick={() => this.exitQueryEditing()}>
                          <span className="btn-lbl">Cancel</span>
                        </a>
                      </div>
                      :
                      this.isAssignable(selectedQuery) &&
                      <div className="opts">
                        {
                          this.isEditable(selectedQuery) &&
                          <a className="btn btn-clear">
                            <span className="btn-lbl ico-edit" onClick={() => this.enterQueryEditing()}>Edit</span>
                          </a>
                        }
                        <a className="btn btn-clear">
                          <span className="btn-lbl ico-export" onClick={() => null}>Export to .xls</span>
                        </a>
                        <a className="btn btn-clear">
                          <span className="btn-lbl ico-re-assign" onClick={() => this.toggleReassignPopup(true)}>Re-assign</span>
                        </a>
                        {user.role !== roles.MANAGEMENT_USER && <a className="btn btn-clear">
                          <span className="btn-lbl ico-watchlist" onClick={() => this.toggleWatch(selectedQuery)}>{this.isWatched(selectedQuery) ? 'Unwatch' : 'Add to Watch List'}</span>
                        </a>
                        }
                        {
                          this.state.isReassignSDM &&
                          <UserSelector
                            className={(this.state.isReassignSDM ? ' open ' : ' ') + (user.role === roles.MANAGEMENT_USER ? ' alt ' : '')}
                            title="Re-assign SDM"
                            toggle={this.toggleReassignPopup}
                            users={users}
                            loadUsers={loadUsers}
                            roles={[roles.DELIVERY_USER]}
                            onChange={user => this.reassignQueries([selectedQuery.id], user.id)}
                          />
                        }
                      </div>
                    }
                  </header>
                  <div className={"modal-body query-info-body " + (this.state.isQueryInfoCollapsed ? 'collapse' : '')}>
                    <ul className="col-view">
                      {
                        fields.map((item, i) => {
                          return i < fields.length / 2 && (
                            <li key={i} className="col-item">
                              <span className="col">{item.label}</span>
                              {
                                  this.shouldRenderFieldValue(item, user.role, isEditingQuery) &&
                                  <span className={"val-" + item.id + " " + selectedQuery[item.id]}>{utils.formatField(selectedQuery, item)}</span>
                              }
                              {
                                this.shouldRenderFieldControl(item, user.role, isEditingQuery) &&
                                <React.Fragment>
                                  {
                                    ['accountName', 'ampId', 'billingIndex', 'valueToBeBilled'].includes(item.id) &&
                                    <input type="text" className="input-ctrl" value={this.state.updatedFields[item.id] || selectedQuery[item.id]} onChange={e=> this.handleChangeField(item.id, e.target.value)} />
                                  }
                                  {
                                    ['status', 'queryType', 'querySubType', 'countryName', 'accountType'].includes(item.id) &&
                                    this.renderFieldSelect(item, selectedQuery, lookup[{
                                      status: 'queryStatusOpts',
                                      queryType: 'typeOpts',
                                      querySubType: 'subTypeOpts',
                                      countryName: 'countryOpts',
                                      accountType: 'accountTypeOpts'
                                    }[item.id]])
                                  }
                                  {
                                    ['passiveApproval'].includes(item.id) &&
                                    <label className="radio-ctrl">
                                      <input type="checkbox" className="chk" checked={this.state.updatedFields[item.id] || selectedQuery[item.id]} onChange={e => this.handleChangeField(item.id, e.target.checked)} />
                                      <span className="radio-label">Yes</span>
                                    </label>
                                  }
                                  {
                                    ['billingStartDate', 'billingEndDate'].includes(item.id) &&
                                    <DatePicker
                                      selected={moment(this.state.updatedFields[item.id] || selectedQuery[item.id])}
                                      onChange={(dateVal) => this.handleChangeField(item.id, dateVal)}
                                      className="input-ctrl datepicker md"
                                      placeholderText="mm/dd/yyyy"
                                    />
                                  }
                                </React.Fragment>
                              }
                            </li>
                          )
                        })
                      }
                    </ul>
                    <ul className="col-view">
                      {
                        fields.map((item, i) => {
                          return i >= fields.length / 2 && (
                            <li key={i}>
                              <span className="col">{item.label}</span>
                              <div className={'val-con ' + (item.id === 'watchers' || item.id === 'requestorName') ? 'watchers-wrap':''}>
                                {
                                  this.shouldRenderFieldValue(item, user.role, isEditingQuery) &&
                                  <React.Fragment>
                                    {
                                      item.type === 'array'
                                        ? selectedQuery[item.id] && selectedQuery[item.id].map((arrayEl, j) => {
                                          return <div key={j}><a>{item.id === 'watchers' ? (get(arrayEl, 'firstName', '') + ' ' + get(arrayEl, 'lastName', '')) : arrayEl.name}</a>&nbsp;</div>
                                        })

                                        : item.format === 'link'
                                          ? <a>{selectedQuery[item.id]}</a>
                                          : <span>{utils.formatField(selectedQuery, item)} </span>
                                    }
                                    {
                                      item.id === 'sdmName' && get(selectedQuery, 'sdm.id', 0) === user.id &&
                                      <span>&nbsp;(ME)</span>
                                    }
                                    {
                                      item.id === 'watchers'
                                      && <div className="add-watchers">
                                        {user.role === roles.DELIVERY_USER && this.isEditable(selectedQuery) && <a onClick={() => this.toggleWatcher(true)}>+Add Watcher</a>}
                                        {
                                          this.state.isWatcherPopVisible &&
                                          <UserSelector
                                            className={this.state.isWatcherPopVisible ? 'open' : ''}
                                            title="Add Watcher"
                                            toggle={this.toggleWatcher}
                                            users={users}
                                            loadUsers={loadUsers}
                                            roles="all"
                                            buttonTitle="Add"
                                            excludes={selectedQuery.watchers}
                                            onChange={user => this.addWatcher(selectedQuery, user)}
                                          />
                                        }
                                      </div>
                                    }
                                    {
                                      item.id === 'requestorName'
                                      && <span className="add-watchers inline">
                                        {user.role === roles.CONTRACT_ADMIN_USER && <a onClick={() => this.toggleRequestor(true)}>Change</a>}
                                        {
                                          this.state.isRequestorPopVisible &&
                                          <UserSelector
                                            className={'change-requestor ' + (this.state.isRequestorPopVisible ? 'open' : '')}
                                            title="Change Requestor"
                                            toggle={this.toggleRequestor}
                                            users={users}
                                            loadUsers={loadUsers}
                                            roles={[roles.CONTRACT_ADMIN_USER]}
                                            onChange={user => this.changeRequestor(selectedQuery, user)}
                                          />
                                        }
                                      </span>
                                    }
                                  </React.Fragment>
                                }
                                {
                                  this.shouldRenderFieldControl(item, user.role, isEditingQuery) &&
                                  <React.Fragment>
                                    {
                                      ['reworkReason', 'requestorName'].includes(item.id) &&
                                      <input type="text" className="input-ctrl" value={this.state.updatedFields[item.id] || selectedQuery[item.id]} onChange={e=> this.handleChangeField(item.id, e.target.value)} />
                                    }
                                    {
                                      ['currencyName', 'dmpsPmps'].includes(item.id) &&
                                      this.renderFieldSelect(item, selectedQuery, lookup[{
                                        currencyName: 'currencyOpts',
                                        dmpsPmps: 'dmpsOpts',
                                      }[item.id]])
                                    }
                                    {
                                      ['dueDate', 'reviseDate'].includes(item.id) &&
                                      <DatePicker
                                        selected={moment(this.state.updatedFields[item.id] || selectedQuery[item.id])}
                                        onChange={(dateVal) => this.handleChangeField(item.id, dateVal)}
                                        className="input-ctrl datepicker md"
                                        placeholderText="mm/dd/yyyy"
                                      />
                                    }
                                    {
                                      ['openedDate', 'closedDate'].includes(item.id) &&
                                      <React.Fragment>
                                        <DatePicker
                                          selected={moment(this.state.updatedFields[item.id] || selectedQuery[item.id])}
                                          onChange={(dateVal) => this.handleChangeField(item.id, dateVal)}
                                          className="input-ctrl datepicker md"
                                          placeholderText="mm/dd/yyyy"
                                        />
                                      </React.Fragment>
                                    }
                                    {
                                      item.id === 'reworkStr' &&
                                      <label className="radio-ctrl">
                                        <input type="checkbox" className="chk" checked={this.state.updatedFields.rework !== undefined ? this.state.updatedFields.rework : selectedQuery.rework} onChange={e => this.handleChangeField('rework', e.target.checked)} />
                                        <span className="radio-label">Yes</span>
                                      </label>
                                    }
                                    {
                                      ['missingInfoOwner', 'missingInfoActionOwner'].includes(item.id) &&
                                      <select className="select-ctrl" value={this.state.updatedFields[item.id]} onChange={e => this.handleChangeField(item.id, e.target.value)}>
                                        <option value="delivery1@test.com">delivery1@test.com</option>
                                        <option value="delivery2@test.com">delivery2@test.com</option>
                                      </select>
                                    }
                                  </React.Fragment>
                                }
                              </div>
                            </li>
                          )
                        })
                      }
                    </ul>
                  </div>
                </div>
                {/* /.query-info */}

                <div className="query-info">
                  <header className="query-header">
                    <h3 className={"query-info-h " + (this.state.isLogHistoryCollapsed ? 'alt' : '')}
                      onClick={this.toggleLogHistoryView}
                    >Log History <i></i></h3>
                  </header>
                </div>

                <div className="section-header">
                  <h3>Workflow Message</h3>
                </div>
                <div className="workflow-msgs">
                  <div className="col-msg">
                    <div className="inner">
                      <h4>{get(selectedQuery, 'requestor.firstName', '') + ' ' + get(selectedQuery, 'requestor.lastName', '')}</h4>
                      <div className="info">"{selectedQuery.comment}"</div>
                      <div className="posted-date">{selectedQuery.openedDate ? moment(selectedQuery.openedDate).format(DATETIME_FORMAT) : ''}</div>
                      <ul className="file-list">
                        {
                          selectedQuery.attachments.map(attach => (
                            <li key={attach.id}><a className="pdf" onClick={() => downloadAttachment(attach)}>{attach.name}</a></li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                  {
                    user.role === roles.DELIVERY_USER && this.isEditable(selectedQuery) &&
                    <div className="col-msg">
                      <h4>SDM</h4>

                      <div className="fieldset">
                        <label>Comment</label>
                        <div className="val">
                          <textarea className={`input-ctrl ${errors.commentInput ? 'error' : ''}`} value={commentInput} onChange={e => this.handleChange('commentInput', e.target.value)}></textarea>
                        </div>
                      </div>

                      <div className="fieldset">
                        <label>Attachments</label>
                        <div className="val">
                          <FileDragDrop onChange={this.onAttachmentsChange} />
                        </div>
                      </div>
                    </div>
                  }
                  {
                    (selectedQuery.status === statuses.CLOSED || selectedQuery.status === statuses.REJECTED) &&
                    <div className="col-msg">
                      <div className="inner">
                        {
                          selectedQuery.sdmComments.map(comment => (
                            <div key={comment.id}>
                              <h4>{get(comment, 'sdm.firstName', '') + ' ' + get(comment, 'sdm.lastName', '')}</h4>
                              <div className="info">Comment: <br/>"{comment.text}"</div>
                              {selectedQuery.status === statuses.REJECTED && <div className="info"><br/><br/>Reject Reason: <br/>"{comment.rejectReason}"</div>}
                              <div className="posted-date">{comment.createdOn ? moment(comment.createdOn).format(DATETIME_FORMAT) : ''}</div>
                              <ul className="file-list">
                                {
                                  comment.attachments.map(attach => (
                                    <li key={attach.id}><a className="pdf" onClick={() => downloadAttachment(attach)}>{attach.name}</a></li>
                                  ))
                                }
                              </ul>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  {
                    this.isEditable(selectedQuery) &&
                      user.role === roles.DELIVERY_USER
                      ? (<div>
                        <a className="btn" onClick={() => this.closeQueries([selectedQuery])}>Submit</a>
                        <a className="btn btn-primary" onClick={this.showRejectReason}>Reject</a>
                      </div>) :
                      (<div>
                        <a className="btn" onClick={this.closeModal}>Close</a>
                      </div>)
                  }
                </div>
                {
                  this.isEditable(selectedQuery) &&
                  user.role === roles.DELIVERY_USER &&
                  <div className="rt">
                    <a className="btn btn-clear" onClick={() => this.closeModal('isQueryDetailsModal')}>Cancel</a>
                  </div>
                }
              </footer>
            </div>
          </div>
        }
        {
          modal && modal.isRespondModal &&
          <div className="modal-wrap">
            <div className="modal modal-bulk-process">
              <header>
                <h2 className="modal-title">
                  {this.getSelectedQueries().length > 1
                    ? <span>Respond to Multiple Queries</span>
                    : <span>Respond to Query</span>
                  }
                </h2>
                <a className="close-modal" onClick={() => this.closeModal('isRespondModal')}> </a>
              </header>
              <div className="modal-content">
                <ul className="multiple-query-list">
                  {
                    this.getSelectedQueries().map((query, i) => {
                      return (
                        <li key={i} className={queryExpanded && queryExpanded.id === query.id ? 'open' : ''}>
                          <div className="li-con">
                            <span className="qid">Query Id {query.id}</span>
                            <div className="qopts">
                              {
                                this.getSelectedQueries().length > 1
                                && <a className="del" onClick={() => selectQuery(false, query)} > </a>
                              }
                              <a className="toggle-handle" onClick={() => this.toggleQueryRow(query)}> </a>
                            </div>
                          </div>
                          {queryExpanded && <QueryDetails query={queryExpanded}></QueryDetails>}
                        </li>
                      )
                    })
                  }
                </ul>

                <div className="sdm-con">
                  <div className="col-msg alt">
                    <h4>SDM</h4>

                    <div className="fieldset-group">
                      <div className="fieldset">
                        <label>Comment</label>
                        <div className="val">
                          <textarea className={`input-ctrl ${errors.commentInput ? 'error' : ''}`} value={commentInput} onChange={e => this.handleChange('commentInput', e.target.value)}></textarea>
                        </div>
                      </div>

                      <div className="fieldset">
                        <label>Attachments</label>
                        <div className="val">
                          <FileDragDrop onChange={this.onAttachmentsChange} />
                        </div>
                      </div>
                    </div>
                    {/* /.fieldset-group */}
                  </div>
                </div>
                {/* /.sdm-con */}
              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={() => this.closeQueries(this.getSelectedQueries())}>Submit</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isRespondModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-bulk-process */}
          </div>
        }

        {
          modal && modal.isRejectModal &&
          <div className="modal-wrap">
            <div className="modal modal-bulk-process">
              <header>
                <h2 className="modal-title">
                  {
                    this.getSelectedQueries().length > 1
                      ? <span>Reject Multiple Queries</span>
                      : <span>Reject Query</span>
                  }
                </h2>
                <a className="close-modal" onClick={() => this.closeModal('isRejectModal')}> </a>
              </header>
              <div className="modal-content">
                <ul className="multiple-query-list">
                  {
                    this.getSelectedQueries().map((query, i) => {
                      return (
                        <li key={i} className={queryExpanded && queryExpanded.id === query.id ? 'open' : ''}>
                          <div className="li-con">
                            <span className="qid">Query Id {query.id}</span>
                            <div className="qopts">
                              {
                                this.getSelectedQueries().length > 1
                                && <a className="del" onClick={() => selectQuery(false, query)} > </a>
                              }
                              <a className="toggle-handle" onClick={() => this.toggleQueryRow(query)}> </a>
                            </div>
                          </div>
                          {queryExpanded && <QueryDetails query={queryExpanded}></QueryDetails>}
                        </li>
                      )
                    })
                  }
                </ul>

                <div className="sdm-con">
                  <div className="col-msg alt">
                    <h4>SDM</h4>
                    <div className="fieldset-group">
                      <div className="fieldset">
                        <label>Comment</label>
                        <div className="val">
                          <textarea className={`input-ctrl ${errors.commentInput ? 'error' : ''}`} value={commentInput} onChange={e => this.handleChange('commentInput', e.target.value)}></textarea>
                        </div>
                      </div>

                      <div className="fieldset">
                        <label>Attachments</label>
                        <div className="val">
                          <FileDragDrop onChange={this.onAttachmentsChange} />
                        </div>
                      </div>
                    </div>
                    {/* /.fieldset-group */}
                  </div>
                </div>
                {/* /.sdm-con */}

                <div className="reject-reason">
                  <label>Reject Reason</label>
                  <div className="select-ctrl-wrap">
                    <select className="select-ctrl" value={rejectReason} onChange={e => this.handleChange('rejectReason', e.target.value)}>
                      {
                        lookup.rejectReason.map((item, i) => {
                          return <option key={i} value={item.value}>{item.value}</option>
                        })
                      }
                    </select>
                  </div>
                </div>
              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn btn-primary" onClick={() => this.rejectQueries(this.getSelectedQueries())}>Reject</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isRejectModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-bulk-process */}
          </div>
        }

        {
          modal && modal.isRejectReasonModal &&
          <div className="modal-wrap">
            <div className="modal modal-reject-reason">
              <header>
                <h2 className="modal-title">
                  <span>Reject Query</span>
                </h2>
                <a className="close-modal" onClick={() => this.closeModal('isRejectReasonModal')}> </a>
              </header>
              <div className="modal-content">

                <div className="reject-reason fluid-h">
                  <label>Reject Reason</label>
                  <div className="select-ctrl-wrap">
                    <select className="select-ctrl" value={rejectReason} onChange={e => this.handleChange('rejectReason', e.target.value)}>
                      {
                        lookup.rejectReason.map((item, i) => {
                          return <option key={i} value={item.value}>{item.value}</option>
                        })
                      }
                    </select>
                  </div>
                </div>

              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn btn-primary" onClick={() => this.rejectQueries([selectedQuery])}>Reject</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isRejectModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-bulk-process */}
          </div>
        }

        {
          modal && modal.isReassignModal &&
          <div className="modal-wrap">
            <div className="modal modal-bulk-process">
              <header>
                <h2 className="modal-title">
                  {
                    this.getSelectedQueries().length > 1
                      ? <span>Re-assign Multiple Queries</span>
                      : <span>Re-assign Query</span>
                  }
                </h2>
                <a className="close-modal" onClick={() => this.closeModal('isReassignModal')}> </a>
              </header>
              <div className="modal-content">
                <ul className="multiple-query-list">
                  {
                    this.getSelectedQueries().map((query, i) => {
                      return (
                        <li key={i} className={this.state.queryExpanded && this.state.queryExpanded.id === query.id ? 'open' : ''}>
                          <div className="li-con">
                            <span className="qid">Query Id {query.id}</span>
                            <div className="qopts">
                              {
                                this.getSelectedQueries().length > 1
                                && <a className="del" onClick={() => selectQuery(false, query)} > </a>
                              }
                              <a className="toggle-handle" onClick={() => this.toggleQueryRow(query)}> </a>
                            </div>
                          </div>
                          {queryExpanded && <QueryDetails query={queryExpanded}></QueryDetails>}
                        </li>
                      )
                    })
                  }
                </ul>

                <div className="reject-reason">
                  <label>Re-assign SDM</label>
                  {
                    reassignedSdm
                      ? <div className="reassigned-sdm">
                        <div><a>{get(reassignedSdm, 'firstName', '') + ' ' + get(reassignedSdm, 'lastName')}</a></div>
                        <div><span>{reassignedSdm.email}</span></div>
                        <a className="del-sdm" onClick={() => this.setState({ reassignedSdm: null })}> </a>
                      </div>
                      :
                      <div>
                        <div className="select-ctrl-wrap">
                          <input type="search" className="input-ctrl search-input" placeholder="Enter username or email" value={reassignSdmInput}
                            onChange={e => this.handleChange('reassignSdmInput', e.target.value)}
                          />
                        </div>
                        <ul className="sdmopts-list">
                          {
                            users.map((user, i) => {
                              return (
                                <li key={i}> <a className="name-link">{get(user, 'firstName', '') + ' ' + get(user, 'lastName')}</a>
                                  <span className="email-col">{user.email}</span>
                                  <span className="select-col"> <a className="btn btn-clear" onClick={() => this.reassignSDM(user)}>Select</a> </span>
                                </li>
                              )
                            })
                          }
                        </ul>
                      </div>
                  }
                </div>

              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={() => { reassignedSdm && this.reassignQueries(map(this.getSelectedQueries(), 'id'), reassignedSdm.id) }}>Submit</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isReassignModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-bulk-process */}
          </div>
        }

        {
          modal && modal.isSendEmailModal &&
          <div className="modal-wrap">
            <div className="modal modal-send-email">
              <header>
                <h2 className="modal-title">Send Email</h2>
                <a className="close-modal" onClick={() => this.closeModal('isSendEmailModal')}> </a>
              </header>

              <div className="modal-content pad-t-sm">
                <div className="section">
                  <div className="fieldset flex mb-lg">
                    <label className="muted">To</label>
                    <div className="field-val width-lg">
                      <input className="input-ctrl font-md text-black" value={emailTo} onChange={e => this.handleChange('emailTo', e.target.value)} />
                    </div>
                  </div>
                  <div className="fieldset flex mb-0">
                    <label className="muted">Subject</label>
                    <div className="field-val width-lg">
                      <input className="input-ctrl font-md text-black" value={emailSubject} onChange={e => this.handleChange('emailSubject', e.target.value)}/>
                    </div>
                  </div>
                </div>
                <div className="section">
                <div className="fieldset flex mb-0">
                    <label className="muted">Message</label>
                    <div className="field-val width-lg">
                      <textarea className="input-ctrl font-md text-black height-md" value={emailMessage} onChange={e => this.handleChange('emailMessage', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={() => { this.sendEmail({ emailTo, emailSubject, emailMessage }, map(this.getSelectedQueries(), 'id'), user.id) }}>Send</a>
                  <a className="btn btn-clear" onClick={() => { this.props.saveSendEmailDraft({ emailTo, emailSubject, emailMessage }, user.id) }}>Save Draft</a>
                </div>
                <div className="rt">
                  <a className="btn btn-clear mr-0" onClick={() => this.closeModal('isSendEmailModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-send-email */}
          </div>
        }

        {
          modal && modal.isEscalateModal &&
          <div className="modal-wrap">
            <div className="modal modal-send-email">
              <header>
                <h2 className="modal-title">Escalation Email</h2>
                <a className="close-modal" onClick={() => this.closeModal('isEscalateModal')}> </a>
              </header>

              <div className="modal-content pad-t-sm">
                <div className="section">
                  <div className="fieldset flex mb-lg">
                    <label className="muted">To</label>
                    <div className="field-val width-lg">
                      <input className="input-ctrl font-md text-black" value={emailTo} onChange={e => this.handleChange('emailTo', e.target.value)} />
                    </div>
                  </div>
                  <div className="fieldset flex mb-0">
                    <label className="muted">Subject</label>
                    <div className="field-val width-lg">
                      <input className="input-ctrl font-md text-black" value={emailSubject} onChange={e => this.handleChange('emailSubject', e.target.value)}/>
                    </div>
                  </div>
                </div>
                <div className="section">
                <div className="fieldset flex mb-0">
                    <label className="muted">Message</label>
                    <div className="field-val width-lg">
                      <textarea className="input-ctrl font-md text-black height-md" value={emailMessage} onChange={e => this.handleChange('emailMessage', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={() => { this.sendEscalationEmail({ emailTo, emailSubject, emailMessage }, map(this.getSelectedQueries(), 'id'), user.id) }}>Send</a>
                  <a className="btn btn-clear" onClick={() => { this.props.saveEscalationEmailDraft({ emailTo, emailSubject, emailMessage }, user.id) }}>Save Draft</a>
                </div>
                <div className="rt">
                  <a className="btn btn-clear mr-0" onClick={() => this.closeModal('isEscalateModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-send-email */}
          </div>
        }

        {
          modal && modal.isMassEditModal &&
          <div className="modal-wrap">
            <div className="modal modal-bulk-process modal-mass-edit">
              <header>
                <h2 className="modal-title">Mass Edit</h2>
                <a className="close-modal" onClick={() => this.closeModal('isMassEditModal')}> </a>
              </header>

              <div className="modal-content">
                <ul className="multiple-query-list">
                  {
                    this.getSelectedQueries().map((query, i) => {
                      return (
                        <li key={i} className={queryExpanded && queryExpanded.id === query.id ? 'open' : ''}>
                          <div className="li-con">
                            <span className="qid">Query Id {query.id}</span>
                            <div className="qopts">
                              {
                                this.getSelectedQueries().length > 1
                                && <a className="del" onClick={() => selectQuery(false, query)} > </a>
                              }
                              <a className="toggle-handle" onClick={() => this.toggleQueryRow(query)}> </a>
                            </div>
                          </div>
                          {queryExpanded && <QueryDetails query={queryExpanded}></QueryDetails>}
                        </li>
                      )
                    })
                  }
                </ul>

                <div className="sdm-con">
                  <div className="col-msg alt">
                    <h4>SDM</h4>

                    <div className="fieldset-group">
                      <div className="fieldset sdm-comment">
                        <label>Comment</label>
                        <div className="val">
                          <textarea className={`input-ctrl ${errors.commentInput ? 'error' : ''}`} value={commentInput} onChange={e => this.handleChange('commentInput', e.target.value)}></textarea>
                        </div>
                      </div>
                    </div>
                    {/* /.fieldset-group */}
                  </div>
                </div>
                {/* /.sdm-con */}

                <div className="mia-owner">
                  <label>Missing Info Action Owner</label>
                  <div className="select-ctrl-wrap">
                    <select className="select-ctrl" value={missingInfoActionOwner} onChange={e => this.handleChange('missingInfoActionOwner', e.target.value)}>
                      {
                        this.getSelectedQueries().map((q, i) => {
                          return <option key={i} value={q.teamName}>{q.teamName}</option>
                        })
                      }
                    </select>
                  </div>
                </div>
              </div>

              <footer className="modal-footer modal-actions mt-md flex">
                <div className="lt">
                  <a className="btn" onClick={() => { this.massEdit({ sdmComment: commentInput, missingInfoActionOwner }, map(this.getSelectedQueries(), 'id'), user.id) }}>Save</a>
                  <a className="btn btn-clear" onClick={() => this.closeModal('isMassEditModal')}>Cancel</a>
                </div>
              </footer>
            </div>
            {/* /.modal-mass-edit */}
          </div>
        }

        {
          modal && modal.isExportExcelModal &&
          <div className="modal-wrap">
            <div className="modal modal-export-excel">
              <header>
                <h2 className="modal-title">Export to Excel</h2>
                <a className="close-modal" onClick={() => this.closeModal('isExportExcelModal')}> </a>
              </header>

              <div className="modal-content pad-t-sm">
                <div className="lt">
                  <div className="field-group">
                    <label className='field-label'>Export Setting</label>
                    <RadioCtrl params={{ label: "Include log history", isChecked: exportLogHistory, }} onChange={this.handleChangeExportLogHistory} />
                    <RadioCtrl params={{ label: "Show preview", isChecked: exportShowPreview }} onChange={val => this.setState({ exportShowPreview: val })} />
                  </div>
                  <div className="field-group mb-0">
                    <label className='field-label'>Specify file name and destination</label>
                    <div className="fieldset flex browse">
                      <label className="muted">Export to</label>
                      <div className="field-val">
                        <input type="file" className="input-ctrl font-md text-black" onChange={e => null} />
                      </div>
                    </div>
                  </div>
                  <footer className="modal-footer modal-actions mt-md flex">
                    <div className="lt">
                      <a className="btn" onClick={() => exportQueries({ exportLogHistory })}>Export</a>
                    </div>
                    <div className="rt">
                      <a className="btn btn-clear mr-0" onClick={() => this.closeModal('isExportExcelModal')}>Cancel</a>
                    </div>
                  </footer>
                </div>
                <div className={`rt ${!exportShowPreview ? 'hidden' : ''}`}>
                  <ul className="list sheet-tabs">
                    <li className={previewSheet === 'sheet1' ? 'on' : ''} onClick={() => this.setState({ previewSheet: 'sheet1' })}>Sheet 1</li>
                    {exportLogHistory &&
                      <li className={previewSheet === 'sheet2' ? 'on' : ''} onClick={() => this.setState({ previewSheet: 'sheet2' })}>Sheet 2</li>
                    }
                  </ul>
                  <div className={previewSheet !== 'sheet1' ? 'hidden' : ''}>
                    <div className="preview-title">Missing Info Queries</div>
                    <div className="table-container">
                      <div className="table table-query table-mid">
                        <div className="table-mid-con">
                          <div className="thead">
                            <div className="tr">
                              {
                                columnsFinal.map((item, i) => (
                                  !item.isDetails && 
                                  <div key={i} className="th">
                                    <span className="thlbl">{item.label}</span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                          <div className="tbody">
                            {
                              dataset.results.map((record, i) => (
                                <div key={i} className={"tr expandable " + record.status + " " + (this.isExpandedRow(record.id) ? 'expanded' : '')}>
                                  <div className="norm tr-inner">
                                    {
                                      columnsFinal.map((item, i) => {
                                        return !item.isDetails && (
                                          <div key={i} className={"td " + (item.isDisabled ? 'disabled' : '')}>
                                            {
                                              item.type === 'array' && record[item.id] && record[item.id].map((arrayEl, j) => {
                                                return j === 0 && <span key={j}>
                                                  <a>{item.id === 'watchers' ? (get(arrayEl, 'firstName', '') + ' ' + get(arrayEl, 'lastName', '')) : arrayEl.name} {record[item.id].length > 1 ? `& ${record[item.id].length - 1} more` : ''} </a>&nbsp;
                                                  </span>
                                              })
                                            }
                                            {
                                              item.type === 'date' && record[item.id] && <span>{moment(record[item.id]).format(DATE_FORMAT)}</span>
                                            }
                                            {
                                              item.type === 'datetime' && record[item.id] && <span>{moment(record[item.id]).format(DATETIME_FORMAT)}</span>
                                            }
                                            {
                                              !item.type && item.format === 'link' && <a>{record[item.id]}</a>
                                            }
                                            {
                                              !item.type && !item.format && <span>{record[item.id]}</span>
                                            }
                                          </div>
                                        )
                                      })

                                    }
                                  </div>
                                  <div className="on-expand tr-inner">
                                    <div className="tr-inner-details">
                                      <div className={"group " + (this.isDetailsItemDisable('billingIndex') ? 'disable' : '')}>
                                        <h4>Billing Index</h4>
                                        <div className="val">{record.billingIndex}</div>
                                      </div>

                                      <div className={"group " + (this.isDetailsItemDisable('billingStartDate') ? 'disable' : '')}>
                                        <h4>Billing Start Date</h4>
                                        <div className="val">{record.billingStartDate ? moment(record.billingStartDate).format(DATE_FORMAT) : 'N/A'}</div>
                                      </div>

                                      <div className={"group " + (this.isDetailsItemDisable('billingEndDate') ? 'disable' : '')}>
                                        <h4>Billing End Date</h4>
                                        <div className="val">{record.billingEndDate ? moment(record.billingEndDate).format(DATE_FORMAT) : 'N/A'}</div>
                                      </div>

                                      <div className={"group " + (this.isDetailsItemDisable('valueToBeBilled') ? 'disable' : '')}>
                                        <h4>Value to be billed</h4>
                                        <div className="val">{record.valueToBeBilled}</div>
                                      </div>

                                      <div className={"group " + (this.isDetailsItemDisable('currencyName') ? 'disable' : '')}>
                                        <h4>Currency</h4>
                                        <div className="val">{record.currencyName}</div>
                                      </div>

                                      <div className={"group " + (this.isDetailsItemDisable('closedDate') ? 'disable' : '')}>
                                        <h4>Date & Time Closed</h4>
                                        <div className="val">{record.closedDate ? moment(record.closedDate).format(DATETIME_FORMAT) : 'N/A'}</div>
                                      </div>

                                      <div className="group comment-group">
                                        <h4>SDM Comments</h4>
                                        <div className="val">{record.sdmComments.map(c => c.text).join('\n')}</div>
                                      </div>

                                      {
                                        record.status === statuses.REJECTED &&
                                        <div className="group comment-group">
                                          <h4>Reject Reason</h4>
                                          <div className="val">{record.sdmComments.map(c => c.rejectReason).join('\n')}</div>
                                        </div>
                                      }

                                      <div className="group">
                                        <h4>Attachments</h4>
                                        <div className="val">{
                                          record.attachments && record.attachments.map((attachment, idx) => {
                                            return (
                                              <div key={idx} className="attachments">
                                                <div className={"file " + attachment.format}><a>{attachment.name}</a></div>
                                              </div>
                                            )
                                          })
                                        }</div>
                                      </div>

                                      <div className="group">
                                        <h4>Rework Reason</h4>
                                        <div className="val">{record.reworkReason}</div>
                                      </div>

                                      <div className="group">
                                        <h4>Requestor</h4>
                                        <div className="val"><a>{record.requestorName}</a></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {
                    exportLogHistory &&
                    <div className={previewSheet !== 'sheet2' ? 'hidden' : ''}>
                      <div className="preview-title">Log History</div>
                      <div className="table-container">
                        <div className="table table-query table-mid">
                          <div className="table-mid-con">
                            <div className="thead">
                              <div className="tr">
                                {
                                  logHistory.headers.map((item, i) => (
                                    <div key={i} className="th">
                                      <span className="thlbl">{item.label}</span>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                            <div className="tbody">
                              {
                                logHistory.data.map((row, i) => (
                                  <div key={i} className="tr">
                                    <div className="td">{row.timestamp}</div>
                                    <div className="td">{row.queryId}</div>
                                    <div className="td">{row.action}</div>
                                    <div className="td">{row.field}</div>
                                    <div className="td">{row.modifiedBy}</div>
                                  </div>
                                ))  
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
            {/* /.modal-export-excel */}
          </div>
        }

        {
          showMessage &&
          <div className="modal-wrap">
            <div className="modal modal-message">
              <header>
                <h2 className="modal-title">{messageTitle}</h2>
                <a className="close-modal" onClick={() => this.setState({ showMessage: false })}> </a>
              </header>

              <div className="modal-content pad-t-sm">
                <pre>{message}</pre>
              </div>
              <footer className="modal-footer modal-actions mt-md ct">
                <a className="btn" onClick={() => this.setState({ showMessage: false })}>Ok</a>
              </footer>
            </div>
          </div>
        }
      </div>
    );
  }
}

QueryTable.propType = {
  params: PT.object,
  closeModal: PT.func,
  showModal: PT.func
}

export default QueryTable;
