// @flow
import React from 'react';

const FinishButton = ({ label, iconClass, onClick, type }) => {
  return(
    <button type={type || 'button'} className="btn finish-btn" onClick={onClick}>
      <span>
        <i className={iconClass} />
        <span style={{ marginLeft: '8px' }}>{label}</span>
      </span>
    </button>
  );
}

export default FinishButton;
