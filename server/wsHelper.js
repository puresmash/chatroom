
const WebSocket = require('ws');

module.exports = (wss, userList) => {

  const broadcast = (data, cb) => {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
    if(cb) cb();
  };
  const logout = (ws, req, message) => {
    const { nickname } = req.session;
    message = message || `${nickname} was disconnected due to inactivity`;

    broadcast(message, () => {
      req.session.destroy();
      ws.terminate();
      clearTimeout(ws.timeoutID);
      userList.delete(nickname);
      console.log(`delete ${nickname}`);
    });
  };

  return {
    broadcast, logout
  };
}
