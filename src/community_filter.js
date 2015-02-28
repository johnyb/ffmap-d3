define("community_filter", [
  "jquery",
  "underscore",
  "lib/backbone",
  "communities"
], function ($, _, Backbone, communities) {
  "use strict"

  var FilterEntryView = Backbone.View.extend({
    className: "entry",
    tagName: "li",
    initialize: function () {
      this.listenTo(this.model, "change:active", this.setActive)
    },
    setActive: function (m) {
      this.$el.toggleClass("active", !!m.get("active"))
    },
    render: function () {
      this.$el.empty()
      var el = $("<a>")
        .attr("href", "#")
        .data("name", this.model.get("name"))
        .addClass("set-filter")
        .text(this.model.get("name"))

      el.appendTo(this.$el)
      return this
    }
  })

  var CommunityFilterView = Backbone.View.extend({
    className: "communityFilter",
    initialize: function () {
      this.$list = $("<ul>")
      this.collection = new communities.Collection()
      this.collection.comparator = "name"
      this.listenTo(this.collection, "add", _.debounce(this.render, 200))
    },
    events: {
      "click a.dropdown-toggle": "toggleDropdown",
      "click a.set-filter": "setFilter"
    },
    setFilter: function (ev) {
      ev.preventDefault()
      var $el = $(ev.currentTarget)
      var model = this.collection.get($el.data("name"))
      this.collection.forEach(function (m) {
        m.unset("active")
      })
      model.set("active", true)
    },
    toggleDropdown: function (ev) {
      ev.preventDefault()
      this.$list.toggleClass("open")
    },
    addCommunity: function (community) {
      return new FilterEntryView({
        model: community
      }).render().$el
    },
    render: function () {
      var self = this
      this.$el.empty()
      this.$el.append(
        $("<a>")
          .attr("href", "#")
          .addClass("dropdown-toggle")
          .text("Select community")
      )
      var el = this.$list
      el.append(
        this.collection.map(self.addCommunity)
      )
      el.appendTo(this.$el)

      return this
    }
  })

  return {
    View: CommunityFilterView
  }
})
