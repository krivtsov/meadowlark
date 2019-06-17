module.exports = (grunt) => {
  ['grunt-contrib-jshint',
    'grunt-exec',
    'grunt-mocha-test',
  ].forEach((task) => {
    grunt.loadNpmTasks(task);
  });

  grunt.initConfig({
    mochaTest: {
      all: {
        options: {
          ui: 'tdd',
          run: true,
        },
        src: ['qa/tests-*.js'],
      },
    },
    jshint: {
      app: ['meadowlar*.js', 'public/js/**/*.js', 'lib/**/*js'],
      qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    exec: {
      linkchecker: { cmd: 'linkchecker --check-extern http://localhost:3000' },
    },
  });

  grunt.registerTask('default', ['mochaTest', 'jshint', 'exec']);
};
