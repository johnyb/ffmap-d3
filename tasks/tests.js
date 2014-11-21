module.exports = function (grunt) {

  grunt.config.merge({
    karma: {
      options: {
        configFile: "karma.conf.js"
      },
      unit: {
        background: true,
        singleRun: false
      },
      ci: {
        background: false,
        singleRun: true
      }
    }
  })

  grunt.loadNpmTasks("grunt-karma")
}
