define("socket_loader", [
  "/socket.io/socket.io.js",
  "lib/Bacon"
], function (io, Bacon) {
  "use strict"

  function loadNodes() {
    var stream = new Bacon.Bus()
    var socket = io.connect()

    stream.plug(Bacon.fromEventTarget(socket, "refresh", function (data) {
      return {
        action: "refresh",
        data: data
      }
    }))

    return stream
  }

  return loadNodes
})
