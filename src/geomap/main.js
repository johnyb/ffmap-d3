define("geomap/main", [
  "jquery",
  "underscore",
  "lib/backbone",
  "lib/leaflet",
  "lib/Bacon",
  "lib/d3",
  "graph",
  "main"
], function ($, _, Backbone, L, Bacon, d3, graph, app) {
  "use strict"

  var GeoNode = graph.Node.extend({
    projectLocation: function () {
      return this.collection.project(this.get("nodeinfo").location)
    },
    lat: function () {
      if (this.get("nodeinfo").location.type === "Point")
          return this.get("nodeinfo").location.coordinates[1]
      return this.get("nodeinfo").location.latitude
    },
    lon: function () {
      if (this.get("nodeinfo").location.type === "Point")
        return this.get("nodeinfo").location.coordinates[0]
      return this.get("nodeinfo").location.longitude
    },
    online: function () {
      return this.get("flags").online
    },
    firmware: function () {
      return this.get("nodeinfo") && this.get("nodeinfo").software && this.get("nodeinfo").software.firmware
    },
    isValid: function () {
      return this.get("nodeinfo") && this.get("nodeinfo").hasOwnProperty("location")
    }
  })
  var GeoNodes = graph.Nodes.extend({
    initialize: function () {
      graph.Nodes.prototype.initialize.apply(this, arguments)

      this.listenTo(this, "reset remove", function (c, options) {
        if (c.attributes) c.trigger("destroy")
        else options.previousModels.forEach(function (m) {
          m.trigger("destroy")
        })
      })
    },
    model: GeoNode,
    project: function (point) {
      return this.graph.project(point)
    }
  })

  var Graph = Backbone.Model.extend({
    initialize: function (options) {
      this.map = options.map

      var nodes = new GeoNodes()
      nodes.graph = this
      this.set("nodes", nodes, { silent: true })
    },
    project: function (x) {
      var point = this.map.latLngToLayerPoint(new L.LatLng(x.latitude, x.longitude))
      return [point.x, point.y]
    }

  })

  var NodeView = Backbone.View.extend({
    initialize: function (options) {
      this.map = options.map

      this.listenTo(this.model, "change", this.updateClassNames)
      this.listenTo(this.model, "destroy", this.removeMarker)
    },
    removeMarker: function () {
      if (this.marker) this.map.removeLayer(this.marker)
    },
    updateClassNames: function () {
      if (!this.marker) return this

      //setStyle does not set the class attribute
      var container = "_container"
      var path = this.marker[container] && this.marker[container].getElementsByClassName("node")[0]
      if (path) {
        path.classList.toggle("offline", !this.model.online())
        path.classList.toggle("legacy", !this.model.firmware())
      }

      return this
    },
    render: function () {
      this.removeMarker()

      var flags = ["node"]
      if (!this.model.online()) flags.push("offline")
      if (!this.model.firmware()) flags.push("legacy")
      this.marker = L.circleMarker([this.model.lat(), this.model.lon()], {
        className: flags.join(" "),
        fillOpacity: 1,
        radius: 5
      })

      this.marker.addTo(this.map)
      return this
    }
  })

  var LinkView = Backbone.View.extend({
    initialize: function (options) {
      this.map = options.map

      this.source = options.source
      this.target = options.target
      this.listenTo(this.source, "destroy", this.removeMarker)
      this.listenTo(this.target, "destroy", this.removeMarker)
    },
    removeMarker: function () {
      if (this.marker) this.map.removeLayer(this.marker)
    },
    updateClassNames: function () {
      if (!this.marker) return this

      return this
    },
    render: function () {
      this.removeMarker()
      if (!this.source.get("nodeinfo").location || !this.target.get("nodeinfo").location) return this

      var points = []
      points.push([this.source.lat(), this.source.lon()])
      points.push([this.target.lat(), this.target.lon()])
      this.marker = L.polyline(points, {
        className: "link",
        opacity: 1
      })

      this.marker.addTo(this.map)

      return this
    }
  })

  var GraphOverlayView = Backbone.View.extend({
    initialize: function (options) {
      if (options.parent) $(options.parent).append(this.$el)

      this.listenTo(this.model.get("nodes"), "add", this.renderNode)
    },
    renderNode: function (node, collection) {
      if (!node.isValid()) return
      new NodeView({
        model: node,
        map: this.model.map
      }).render()

      var self = this
      node.get("neighbours").forEach(function (id) {
          var neighbour = collection.get(id)
          if (!neighbour) return

          self.renderLink(node, neighbour)
      })
    },
    renderLink: function (source, target) {
      if (!source.isValid() && !target.isValid()) return
      new LinkView({
        source: source,
        target: target,
        map: this.model.map
      }).render()
    },
    renderNodes: function () {
      this.model.get("nodes").forEach(function (n) {
        this.renderNode(n)
      }.bind(this))

      return this
    },
    render: function () {
      this.renderNodes()
      return this
    }
  })

  var MainView = Backbone.View.extend({
    tagName: "div",
    initialize: function (options) {
      this.$map = $("<div>").attr("id", "map")

      this.map = new L.Map(this.$map[0], {
        worldCopyJump: true
      })

      L.control.scale().addTo(this.map)

      this.map.addLayer(new L.TileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
        subdomains: "1234",
        type: "osm",
        attribution: "Map data Tiles &copy; <a href=\"http://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"http://developer.mapquest.com/content/osm/mq_logo.png\" />, Map data © OpenStreetMap contributors, CC-BY-SA",
        opacity: 0.7
      }))

      var cluster = new L.MarkerClusterGroup({
        disableClusteringAtZoom: 16,
        maxClusterRadius: 50,
        chunkedLoading: true
      })

      this.graph = new GraphOverlayView({
        parent: this.map.getPanes().overlayPane,
        model: new Graph({
          map: cluster
        })
      })

      this.map.addLayer(cluster)

      this.lat = options.lat || 0
      this.lon = options.lon || 0
      this.zoom = options.zoom || this.map.getMaxZoom()
      this.map.setView(L.latLng(this.lat, this.lon), this.zoom)

      this.map.on("moveend", _.throttle(function (ev) {
        var map = ev.target
        var center = map.getCenter()
        var zoom = map.getZoom()

        app.router.navigate("geomap?lat=" + center.lat + "&lon=" + center.lng + "&zoom=" + zoom)
      }, 1000, { leading: false }))
      this.listenTo(this, "route", function (params) {
        this.lat = params.lat || 0
        this.lon = params.lon || 0
        this.zoom = params.zoom || this.zoom || this.map.getMaxZoom()
        this.map.setView(L.latLng(this.lat, this.lon), this.zoom)
      })
    },
    render: function () {
      this.$el.empty().append(this.$map)
      this.map.invalidateSize()
      this.graph.render()
      return this
    }
  })

  var Menu = Backbone.View.extend({
    render: function () {
      this.$el.empty().append(
        $("<button>")
          .attr("id", "gpsbutton")
          .text("Koordinaten beim nächsten Klick anzeigen")
          .on("click", function () {
            console.log(mainView)
          }
        )
      )

      return this
    }
  })

  var mainView, menuView

  return {
    createMainView: function (options) {
      if (!mainView) mainView = new MainView(options)

      return mainView
    },
    createMenu: function (options) {
      if (!menuView) menuView = new Menu(options)

      return menuView
    },
    run: function () {
    },
    trigger: function () {
      if (mainView) mainView.trigger.apply(mainView, arguments)
    }
  }
})
