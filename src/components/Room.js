import React, { Component } from 'react';
import MessageItem from './ui/MessageItem';

class Room extends Component {

  constructor() {
    super();
    this.state = {
      text: '',
      messageList: []
    };
  }
  componentDidUpdate(prevProps, prevState) {
    if(prevState.messageList !== this.state.messageList) {
      this.chatWrap.scrollTop = this.chatWrap.scrollHeight;
    }
  }
  componentDidMount () {
    const { ws } = this.props;
    ws.onopen = () => {
      console.log('connection established');
      ws.send(JSON.stringify({
        type: 'JOIN',
        message: 'client reply connection established'
      }));
    }
    ws.onerror = () => console.log('WebSocket error');
    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onmessage = this.onReceiveMessage;
  }

  // componentWillUnmount() {}

  sendMessage = () => {
    const { ws } = this.props;
    const { text } = this.state;
    console.log('Sending message to server: ' + text);
    ws.send(JSON.stringify({ message: text, time: Date.now() }));
    this.setState({ text: ''});
  }

  onReceiveMessage = (event) => {
    const { messageList } = this.state;
    let json = null;
    try{
      json = JSON.parse(event.data);
    }
    catch(e) {
      json = { message: event.data };
    }
    // console.warn(event)
    this.setState({
      messageList: [
        ...messageList, {
        nickname: json.nickname,
        message: json.message,
        time: json.time
      }]
    });
  }

  renderMessageList = () => {
    const { messageList } = this.state;
    const { nickname } = this.props;
    return messageList.map((ele, i) =>
      <MessageItem key={i} self={nickname === ele.nickname}>
        {ele}
      </MessageItem>
    );
  }

  logout = () => {
    const { nickname } = this.state;
    fetch(`http://${window.location.hostname}:8080/logout`, { credentials: 'include' });
  }

  render() {
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        if(this.state.text.length > 0) {
          this.sendMessage();
        }
      }}>
        <div className="room" style={{ border: '1px solid lightseagreen' }}>
          <div style={{ padding: '16px', backgroundColor: 'lightseagreen' }}>
            <h2 style={{ margin: 0 }}>{this.props.nickname}</h2>
            <button type="button" className="btn" onClick={this.logout}>Logout</button>
          </div>
          <div ref={(wrap) => this.chatWrap = wrap} className="chat-content" style={{ flex: 1 }}>
            {this.renderMessageList()}
          </div>
          <div className="editor-wrapper">
            <input className="input" type="text" value={this.state.text}
              onChange={e => this.setState({ text: e.target.value })}
            />
            <button type="submit" className="btn">
              Send
            </button>
          </div>
        </div>
      </form>
    );
  }
}

export default Room;
