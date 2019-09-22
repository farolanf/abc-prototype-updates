import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import './FilterQueryTable.scss';

// FilterQueryTable component
class FilterQueryTable extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.resetFilter = this.resetFilter.bind(this);

    this.defaultState = {
      queryId: "",
      sapContract: "",
      currencyId: '',
      exceptionTypeIds: '',
      countryId: '',
      dueDateStart: null,
      dueDateEnd: null,
      accountName: '',
      sdm: '',
      comment: '',
      ampId: '',
      requestor: ''
    }
    this.state = {
      ...this.defaultState
    }
  }

  onChange(key, value){
    this.setState({
      [key]: value
    });
  }

  applyFilter(){
    this.props.applyFilter(this.state)
  }

  resetFilter(){
    this.setState({
      ...this.defaultState
    }, this.applyFilter)
  }

  render() {
    const { lookup, closeFilter } = this.props;
    const { queryId, sapContract, currencyId, exceptionTypeIds, countryId, dueDateStart, dueDateEnd, accountName, sdm, comment, ampId, requestor} = this.state;
    return (
      <div className={"filter-query-table " + this.props.className}>
        <header className="filter-header">
          <h3>Filter</h3>
          <a className="close-filter" onClick={closeFilter}> </a>
        </header>
        <div className="filter-body">
          <div className="col-filter">
            <div className="fieldset">
              <label>Query Id</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="queryId" value={queryId} onChange={e=>this.onChange('queryId', e.target.value)} />
              </div>
            </div>
            <div className="fieldset">
              <label>Query Type</label>
              <div className="val">
                <div className="select-wrap">
                  <select className="select-ctrl" value={exceptionTypeIds} onChange={e=>this.onChange('exceptionTypeIds', e.target.value)}>
                    <option value="">Select</option>
                    {
                      lookup.exceptionTypes && lookup.exceptionTypes.map((item, i) => {
                        return (
                          <option key={i} value={item.id}>{item.value}</option>
                        )
                      })
                    }
                  </select>
                </div>
              </div>
            </div>
            <div className="fieldset">
              <label>Account Name</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="account" value={accountName} onChange={e=>this.onChange('accountName', e.target.value)} />
              </div>
            </div>
            <div className="fieldset">
              <label>AMP ID</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="ampId" value={ampId} onChange={e=>this.onChange('ampId', e.target.value)} />
              </div>
            </div>
          </div>
          {/* col-filter */}
          <div className="col-filter">
            <div className="fieldset">
              <label>SAP Contract No</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="sapContractNo" value={sapContract} onChange={e=>this.onChange('sapContract', e.target.value)} />
              </div>
            </div>
            <div className="fieldset">
              <label>Country</label>
              <div className="val">
                <div className="select-wrap">
                  <select className="select-ctrl" value={countryId} onChange={e=>this.onChange('countryId', e.target.value)}>
                    <option value="">Select</option>
                    {
                      lookup.countries && lookup.countries.map((item, i) => {
                        return (
                          <option key={i} value={item.id}>{item.value}</option>
                        )
                      })
                    }
                  </select>
                </div>
              </div>
            </div>
            <div className="fieldset">
              <label>SDM</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="sdm" value={sdm} onChange={e=>this.onChange('sdm', e.target.value)} />
              </div>
            </div>
            <div className="fieldset">
              <label>Requestor</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="requestor" value={requestor} onChange={e=>this.onChange('requestor', e.target.value)} />
              </div>
            </div>
          </div>
          {/* col-filter */}
          <div className="col-filter">
            <div className="fieldset">
              <label>Currency</label>
              <div className="val">
                <div className="select-wrap">
                  <select className="select-ctrl md" value={currencyId} onChange={e=>this.onChange('currencyId', e.target.value)}>
                    <option value="">Select</option>
                    {
                      lookup.currencies && lookup.currencies.map((item, i) => {
                        return (
                          <option key={i} value={item.id}>{item.value}</option>
                        )
                      })
                    }
                  </select>
                </div>
              </div>
            </div>

            <div className="fieldset">
              <label>Due Date</label>
              <div className="val">
                <div className="date-range">
                  <DatePicker
                    selected={dueDateStart}
                    onChange={(dateVal) => this.onChange('dueDateStart', dateVal)}
                    className="input-ctrl datepicker md"
                    placeholderText="mm/dd/yyyy"
                  />
                  <span className="to">To</span>
                  <div className="datepicker-wrap">
                  <DatePicker
                    selected={dueDateEnd}
                    onChange={(dateVal) => this.onChange('dueDateEnd', dateVal)}
                    className="input-ctrl datepicker md alt "
                    placeholderText="mm/dd/yyyy"
                  />
                  </div>
                </div>
              </div>
            </div>

            <div className="fieldset">
              <label>Comments</label>
              <div className="val">
                <textarea className="input-ctrl md" id="comment" value={comment} onChange={e=>this.onChange('comment', e.target.value)} />
              </div>
            </div>
          </div>
          {/* col-filter */}
        </div>
        <footer className="filter-actions">
          <a className="btn" onClick={this.applyFilter}>Apply</a>
          <a className="btn btn-clear" onClick={this.resetFilter}>Reset</a>
        </footer>
      </div>
    );
  }
}

FilterQueryTable.propType = {

}

export default FilterQueryTable;
