const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const helper = require('./wsHelper');
const config = require('./config.json');

const userList = new Map([['admin', null]]);

const app = express();
const MAX_IDLE = config.MAX_IDLE * 1000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});
app.use(sessionParser);

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
  const nickname = req.session.nickname;
  // console.log(userList.keys())
  // console.log(nickname)
  // console.log(userList.has(nickname))
  const userObj = userList.get(nickname);
  // initial timeout
  if(userObj && !userObj.timeoutID) {
    userObj.timeoutID = setTimeout(() => logout(nickname, req), MAX_IDLE);
  }
  // console.log('Here comes');
  // console.log(nickname, req.session, req.session.id);
  ws.nickname = nickname;
  // maintain ws connection array
  if(userObj && userObj.wsAry) {
    userObj.wsAry.push(ws);
  }
  else {
    broadcast(`${nickname} has joined this room`);
    userObj.wsAry = [ws];
  }

  ws.on('message', function incoming(message) {
    // reset timer
    clearTimeout(userObj.timeoutID);
    userObj.timeoutID = setTimeout(() => logout(nickname, req), MAX_IDLE);

    const json = JSON.parse(message);
    // System message
    if(json.type === 'JOIN') return;
    // Normal message
    console.log(`Received message from ${nickname}: ${json.message}`);
    broadcast(JSON.stringify({ nickname, message: json.message, time: json.time }));
  });
  ws.send('Server connected');
});

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
