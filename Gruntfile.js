module.exports = function(grunt) {
  grunt.initConfig({
    'compile-handlebars': {
        allStatic: {
          template: 'templates/batch.handlebars',
          templateData: 'templates/icons.json',
          output: './batch.json'
        },
    }
  });

  grunt.loadNpmTasks('grunt-compile-handlebars');
  grunt.registerTask('default', 'compile-handlebars');
  grunt.registerTask('index-icons', 'Push batch.json to Algolia\'s server', function() {
    // required api key
    var personalApiKey = grunt.option('apikey');
    if (!personalApiKey) {
      grunt.log.write("Checking API key...").error();
      grunt.log.write("Please provide a valid API key with option --apikey")
      return;
    }

    // this task is async
    var done = this.async();

    // init Algolia API client
    var init = grunt.log.write("Initialize Algolia's client...");
    var Algolia = require('algolia-search');
    var client = new Algolia('9JQV0RIHU0', personalApiKey);
    init.ok();

    // prepare index
    init = grunt.log.write("Clearing index...");
    client.deleteIndex('icons');
    var index = client.initIndex('icons');
    index.setSettings({ attributesToIndex: ["name", "tags"]});
    init.ok();

    // push data
    var push = grunt.log.write("Push batch.json...");
    index.addObjects(require('./batch.json'), function(error, content) {
      if (error) {
        push.error();
        done(false);
      } else {
        push.ok();
        done();
      }
    });
  });
};
