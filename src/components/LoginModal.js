import React, { Component } from 'react';
import FinishButton from './ui/FinishButton';

const Row = ({ children }) => <div className="modal-row">{children}</div>

class LoginModal extends Component {
  constructor() {
    super();
    this.state = {
      nickname: ''
    };
  }

  componentDidMount = () => {
    this.recover();
  }

  recover = () => {
    fetch(`http://${window.location.hostname}:8080/recover`, { credentials: 'include' })
    .then(res => res.json())
    .then(json => {
      if(json.nickname){
        this.setState({ nickname: json.nickname });
        this.props.onSuccess(json.nickname);
      }
    })
  }

  login = () => {
    const { nickname } = this.state;
    if(nickname.length === 0) return;

    fetch(`http://${window.location.hostname}:8080/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ nickname })
    })
    .then(res => res.json())
    .then(json => {
      const { result, nickname, errorMsg } = json;
      console.log(json)
      if(result === 'success') {
        console.log('Successful login with ' + nickname)
        this.props.onSuccess(nickname);
      }
      else {
        console.error(errorMsg)
        this.setState({ errorMsg });
      }
    })
  }

  render() {
    return (
      <form className="login-modal" onSubmit={(e) => {
        e.preventDefault();
        this.login();
      }}>
        <Row>
          <label>NICKNAME</label>
          <input type="text" value={this.state.nickname}
            onChange={(e) => this.setState({ nickname: e.target.value })}
          />
          <FinishButton type="submit" label="Sign in" iconClass="fa fa-sign-in"/>
        </Row>
        <span className="error-msg">{ this.state.errorMsg }</span>
      </form>
    );
  }
}

export default LoginModal;
