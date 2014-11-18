define("graph", [
  "/socket.io/socket.io.js",
  "underscore",
  "lib/backbone"
], function (io, _, Backbone) {

  var Node = Backbone.Model.extend({
  })

  var Nodes = Backbone.Collection.extend({
    initialize: function (options) {
      this.options = options
      this.socket = io.connect()
      var self = this
      this.socket.on("refresh", function (data) {
        self.reset(
          _(data.nodes).pairs()
          .map(function (n) {
            n[1].id = n[0]
            return n[1]
          })
          .filter(self.filterNode)
        )
      })
    },
    model: Node,
    filterNode: function () {
      return true
    }
  })

  return {
    Nodes: Nodes,
    Node: Node
  }
})
