module.exports = function(grunt) {
  grunt.initConfig({
    'merge-json': {
      icons: {
          src: [ "data/icons-*.json" ],
          dest: "data/icons.json"
      }
    },
    'compile-handlebars': {
      remote: {
        template: 'templates/batch.handlebars',
        templateData: 'data/icons.json',
        output: 'data/batch.json'
      }
    }
  });

  grunt.loadNpmTasks('grunt-merge-json');
  grunt.loadNpmTasks('grunt-compile-handlebars');

  grunt.registerTask('default', function(){
    grunt.task.run('build');
  });

  grunt.registerTask('build', ['merge-json', 'compile-handlebars']);

  grunt.registerTask('index', 'Push batch.json to Algolia\'s server', function() {
    // required api key
    var personalApiKey = grunt.option('apikey');
    if (!personalApiKey) {
      grunt.log.write("Checking API key...").error();
      grunt.log.write("Please provide a valid API key with option --apikey");
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
    index.setSettings({ 'attributesToIndex' : ["name", "tags"], 'customRanking' : ["asc(name)"], 'queryType' : 'prefixAll' });
    init.ok();

    // push data
    var push = grunt.log.write("Push batch.json...");
    index.addObjects(require('./data/batch.json'), function(error, content) {
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
