define("graph", [
  "/socket.io/socket.io.js",
  "underscore",
  "lib/backbone"
], function (io, _, Backbone) {
  "use strict"

  var Node = Backbone.Model.extend({
    isValid: function () {
      return true
    }
  })

  var socket = io.connect()

  var Nodes = Backbone.Collection.extend({
    initialize: function (options) {
      this.options = options
      var self = this
      socket.on("nodes:reset", function () {
        self.reset([])
      })
      socket.on("nodes:add", function (nodes) {
        if (!_.isArray(nodes)) nodes = [nodes]
        _.defer(function () {
          self.add(nodes)
        })
      })
      socket.emit("refresh:nodes")
    },
    model: Node
  })

  var Link = Backbone.Model.extend({
    isValid: function () {
      return true
    }
  })

  var Links = Backbone.Collection.extend({
    initialize: function (options) {
      this.options = options
      var self = this
      socket.on("links:reset", function () {
        self.reset([])
      })
      socket.on("links:add", function (links) {
        if (!_.isArray(links)) links = [links]
        _.defer(function () {
          self.add(links)
        })
      })
      socket.emit("refresh:links")
    },
    model: Link
  })

  return {
    Nodes: Nodes,
    Node: Node,
    Link: Link,
    Links: Links
  }
})
