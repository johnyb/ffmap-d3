define("communities", [
  "socket_loader",
  "lib/backbone"
], function (socket, Backbone) {
  "use strict"

  var Community = Backbone.Model.extend({
    idAttribute: "name"
  })

  var Communities = Backbone.Collection.extend({
    initialize: function () {
      var self = this
      socket.on("communities:index", function (cs) {
        self.add(cs, {
          merge: true
        })
      })
      socket.emit("communities:index")
      this.listenTo(this, "change:active", this.applyFilter)
    },
    applyFilter: function (m, val) {
      if (!val) return

      socket.emit("communities:applyFilter", m.get("name"))
    },
    model: Community
  })

  return {
    Collection: Communities,
    Model: Community
  }
})
