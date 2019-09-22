import React, { Component } from 'react';
import PT from 'prop-types';
import DatePicker from 'react-datepicker';
import './FilterUsersManagementTable.scss';

// FilterUsersManagementTable component
class FilterUsersManagementTable extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.resetFilter = this.resetFilter.bind(this);

    this.state = {
      addOn: null,
      username: '',
      email: '',
      status: ''
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
      addOn:null,
      username: '',
      email: '',
      status: ''
    }, this.applyFilter)
  }

  render() {
    const { lookup, closeFilter} = this.props;
    const { addOn, username, email, status} = this.state;

    return (
      <div className={"filter-query-table fluid-h " + this.props.className}>
        <header className="filter-header">
          <h3>Filter</h3>
          <a className="close-filter" onClick={closeFilter}> </a>
        </header>
        <div className="filter-body fluid-h">
          <div className="col-filter">
            <div className="fieldset">
              <label>Username</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="queryId" value={username} onChange={e=>this.onChange('username', e.target.value)} />
              </div>
            </div>

            <div className="fieldset">
              <label>Status</label>
              <div className="val">
                <div className="select-wrap">
                  <select className="select-ctrl" value={status} onChange={e=>this.onChange('status', e.target.value)}>
                    <option value="">All</option>
                    {
                      lookup.statusOpts && lookup.statusOpts.map((item, i) => {
                        return (
                          <option key={i} value={item.value}>{item.value}</option>
                        )
                      })
                    }
                  </select>
                </div>
              </div>
            </div>
            
          </div>
          {/* col-filter */}
          <div className="col-filter">
            <div className="fieldset">
              <label>Added On</label>
              <div className="val">
                <div className="date-range size-md">
                  <DatePicker
                    selected={addOn}
                    onChange={value=>this.onChange('addOn', value)}
                    className="input-ctrl datepicker md"
                    placeholderText="mm/dd/yyyy"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* col-filter */}
          <div className="col-filter">

            <div className="fieldset">
              <label>Email address</label>
              <div className="val">
                <input type="text" className="input-ctrl" id="address" value={email} onChange={e=>this.onChange('email', e.target.value)} />
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

FilterUsersManagementTable.propType = {
  filterActions: PT.object
}

export default FilterUsersManagementTable;
