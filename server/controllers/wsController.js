
const express = require('express')
const router = express.Router();
const helper = require('../wsHelper');

module.exports = (wss, userList) => {

  const { broadcast, logout } = helper(wss, userList);

  const login = (nickname, req, res) => {
    // console.log(userList.keys())
    userList.set(nickname, {});
    // console.log(userList.keys())
    req.session.nickname = nickname;
    res.send({ result: 'success', nickname });
  }
  const checkRecover = (req) => {
    if(req.session && req.session.nickname) {
      return { status: true, nickname: req.session.nickname };
    }
    return { status: false };
  }

  router.post('/login', (req, res) => {
    const { nickname } = req.body;
    console.log(nickname)
    // recover
    const recover = checkRecover(req);
    if(recover.status === true) {
      res.json({ result: 'success', nickname: recover.nickname })
    }
    // check duplicate
    if(userList.has(nickname)){
      res.send({
        result: 'failed',
        errorMsg: `Nickname ${nickname} is already taken`
      });
    }
    // login
    login(nickname, req, res);
  });

  router.get('/recover', (req, res) => {
    console.log('===RECOVER===')
    console.log(req.session.id);
    res.json(checkRecover(req));
  })

  router.get('/logout', (req, res) => {
    const nickname = req.session.nickname;
    const message = `${req.session.nickname} left the chat, connection lost`;
    logout(nickname, req, message);
  });

  return router;
};
