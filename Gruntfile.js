module.exports = (grunt) => {
  ['grunt-contrib-jshint',
    'grunt-exec',
    'grunt-mocha',
  ].forEach((task) => {
    grunt.loadNpmTasks(task);
  });

  grunt.initConfig({
    mocha: {
      all: {
        src: ['qa/tests-*.js'],
        options: {
          ui: 'tdd',
          run: true,
        },
      },
    },
    jshint: {
      app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*js'],
      qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
    },
    exec: {
      linkchecker: { cmd: 'linkchecker http://localhost:3000' },
    },
  });

  grunt.registerTask('default', ['mocha', 'jshint', 'exec']);
};
