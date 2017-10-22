const express = require('express');
const session = require('express-session');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const helper = require('./wsHelper');

const userList = new Map([['admin', null]]);

const app = express();
const MAX_IDLE = 30 * 1000;

/**
 * CORS
 */
app.use((req, res, next)=>{
  res.append('Access-Control-Allow-Origin', req.header('Origin'));
  res.append('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  res.append('Access-Control-Allow-Credentials', true);
  res.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});
app.use(sessionParser);

const server = http.createServer(app);
const wss = new WebSocket.Server({
  verifyClient: (info, done) => {
      console.log('Parsing session from request...');
      sessionParser(info.req, {}, () => {
        console.log('Session is parsed!');

        //
        // We can reject the connection by returning false to done(). For example,
        // reject here if user is unknown.
        //
        done(info.req.session.nickname);
      });
  },
  server
});

const { broadcast, logout } = helper(wss, userList);

app.use(require('./controllers/wsController.js')(wss, userList));

wss.on('connection', function connection(ws, req) {
  let timeoutID = setTimeout(() => logout(ws, req), MAX_IDLE);
  const nickname = req.session.nickname;
  ws.nickname = nickname;
  ws.timeoutID = timeoutID;
  userList.set(nickname, ws);
  ws.on('message', function incoming(message) {
    // reset
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => logout(ws, req), MAX_IDLE);
    ws.timeoutID = timeoutID;
    let json = null;
    try{
      json = JSON.parse(message);
    }
    catch(e) {
      console.log('Parsing failed');
    }
    // JOIN
    if(json.type === 'JOIN') {
      broadcast(`${nickname} has joined this room`);
      return;
    }
    console.log(`Received message from ${nickname}: ${json.message}`);
    broadcast(JSON.stringify({ nickname, message: json.message, time: json.time }));
  });
  ws.send('Server connected');
});

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
