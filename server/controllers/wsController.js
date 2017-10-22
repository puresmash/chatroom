
const express = require('express')
const router = express.Router();
const helper = require('../wsHelper');

module.exports = (wss, userList) => {

  const { broadcast, logout } = helper(wss, userList);

  const login = (nickname, req, res) => {
    userList.set(nickname, null);
    req.session.nickname = nickname;
    res.send({ result: 'success' });
  }

  router.get('/login/:nickname', (req, res) => {
    const { nickname } = req.params;
    console.log(nickname)
    if(userList.has(nickname)){
      res.send({
        result: 'failed',
        errorMsg: `Nickname ${nickname} is already taken`
      });
    }
    login(nickname, req, res);
  });

  router.get('/logout', (req, res) => {
    const nickname = req.session.nickname;
    const message = `${req.session.nickname} left the chat, connection lost`;
    logout(userList.get(nickname), req, message);
  });

  return router;
};
