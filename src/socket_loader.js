define("socket_loader", [
  "/socket.io/socket.io.js",
  "lib/Bacon"
], function (io) {
  "use strict"

  var socket = io.connect()

  return socket
})
