import React from 'react';
import moment from 'moment';
import Avator from './Avator';

const Content = ({ children, ...others }) => {
  return (
      <span className="message" {...others}>{children}</span>
  );
}

const MessageItem = ({ children, self }) => {
  const { nickname, message, time } = children;
  return (
    <div className="message-wrapper" style={self ? { justifyContent: 'flex-end' } : null}>
      { !self && nickname &&
        <Avator>{nickname && nickname.substr(0, 1)}</Avator>
      }
      <div className="message-content" style={{ order: 2 }}>
        {!self && <span>{nickname}</span>}
        <Content style={!self ? { backgroundColor: 'gainsboro' } : null}>{children.message}</Content>
      </div>
      {
        children.time &&
        <span className="message-time" style={self ? { order: 1, margin: '0 8px 0 0' } : { order: 3 }}>
          {moment(children.time).format('A HH:mm')}
        </span>
      }
    </div>
  );
}

export default MessageItem;
