module.exports = function(grunt) {
  grunt.initConfig({
    'compile-handlebars': {
        allStatic: {
          template: 'templates/index.handlebars',
          templateData: 'templates/icons.json',
          output: './index.html'
        },
    }
  });

  grunt.loadNpmTasks('grunt-compile-handlebars');
  grunt.registerTask('default', 'compile-handlebars');
};
