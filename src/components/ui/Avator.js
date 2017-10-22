import React from 'react';

const Avator = ({ children }) =>
  <div className="avator">
    <div className="avator-border">
      <span>{children}</span>
    </div>
  </div>;

export default Avator;
