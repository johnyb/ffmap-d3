define("graph", [
  "/socket.io/socket.io.js",
  "underscore",
  "lib/backbone"
], function (io, _, Backbone) {
  "use strict"

  var Node = Backbone.Model.extend({
  })

  var Nodes = Backbone.Collection.extend({
    initialize: function (options) {
      this.options = options
      this.socket = io.connect()
      var self = this
      this.socket.on("nodes:reset", function () {
        self.reset([])
      })
      this.socket.on("nodes:add", function (nodes) {
        if (!_.isArray(nodes)) nodes = [nodes]
        _.defer(function () {
          self.add(nodes.filter(function (node) {
            return self.filterNode(node)
          }))
        })
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
