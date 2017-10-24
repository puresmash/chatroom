
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
  const logout = (nickname, req, message) => {
    message = message || `${nickname} was disconnected due to inactivity`;

    broadcast(message, () => {
      req.session.destroy();
      const { wsAry } = userList.get(nickname);
      userList.delete(nickname);
      wsAry.forEach(ws => {
        clearTimeout(ws.timeoutID);
        ws.terminate();
      })
      console.log(`delete ${nickname}`);
    });
  };

  return {
    broadcast, logout
  };
}
