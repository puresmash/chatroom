import React, { Component } from 'react';
// import WebSocket from 'ws';
import Room from './components/Room';
import LoginModal from './components/LoginModal';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.state = {
      ws: null,
      nickname: null
    };
  }

  componentDidMount () {

  }

  createConnection = () => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
    this.setState({ ws });
    // ws.onopen = () => {
    //   console.log('connection established');
    //   ws.send('client reply connection established');
    // }
    // ws.onerror = () => console.log('WebSocket error');
    ws.onclose = () => this.setState({ ws: null });
  }

  render() {
    const { ws, nickname } = this.state;
    return (
      <div>
        {
          !ws &&
          <LoginModal onSuccess={(nickname) => {
            this.createConnection();
            this.setState({ nickname });
          }}/>
        }
        {ws && <Room ws={ws} nickname={nickname}/>}
      </div>
    );
  }
}

export default App;
