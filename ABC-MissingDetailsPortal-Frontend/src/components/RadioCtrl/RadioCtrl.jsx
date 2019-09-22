import React, { Component } from 'react';
import PT from 'prop-types';
import './RadioCtrl.scss';

// RadioCtrl component: This component contains the view & functions related to user loggin
class RadioCtrl extends Component {
  render() {
    const {params: {label, isChecked}, onChange} = this.props;

    return (<label className="radio-ctrl">
      <input type="checkbox" checked={isChecked} onChange={e=>{onChange(e.target.checked)}} className="chk" />
      <span className="radio-label">{label}</span>
    </label>);
  }
}

RadioCtrl.propType = {
  params: PT.object
}

export default RadioCtrl;
