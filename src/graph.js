define("graph", [
  "socket_loader",
  "underscore",
  "lib/backbone"
], function (socket, _, Backbone) {
  "use strict"

  var Node = Backbone.Model.extend({
    isValid: function () {
      return true
    }
  })

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
      socket.on("nodes:remove", function (nodes) {
        if (!_.isArray(nodes)) nodes = [nodes]
        _.defer(function () {
          self.remove(nodes)
        })
      })
      socket.on("nodes:update", function (nodes) {
        if (!_.isArray(nodes)) nodes = [nodes]
        _.defer(function () {
          self.add(nodes, { merge: true })
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
      socket.on("links:remove", function (links) {
        if (!_.isArray(links)) links = [links]
        _.defer(function () {
          self.remove(links)
        })
      })
      socket.on("links:update", function (links) {
        if (!_.isArray(links)) links = [links]
        _.defer(function () {
          self.add(links, { merge: true })
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
