"use strict"

module.exports = function (grunt) {
  grunt.config.merge({
    connect: {
      server: {
        options: {
          base: "build/", //TODO: once grunt-contrib-connect 0.9 is released, set index file
          livereload: true
        }
      }
    },
    watch: {
      sources: {
        options: {
          livereload: true
        },
        files: ["{css,img}/*.png", "css/*.css", "src/**/*.js", "templates/*.html"],
        tasks: ["default", "karma:unit:run"]
      },
      config: {
        options: {
          reload: true,
          livereload: true
        },
        files: ["Gruntfile.js", "tasks/*.js"],
        tasks: ["default"]
      }
    }
  })

  grunt.loadNpmTasks("grunt-contrib-connect")
  grunt.loadNpmTasks("grunt-contrib-watch")
}
