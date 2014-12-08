module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    "uglify": {
      options: {
        banner: '//! Copyright © 2014 John Watson <john@watson-net.com> All rights reserved\n// Build date: <%= grunt.template.today("yyyy-mm-dd") %>\n'
      },
      build: {
        files: {
          'build/game.min.js': [ "game/src/G.js", "game/src/BootState.js", "game/src/EndState.js", "game/src/GameState.js", "game/src/MenuState.js", "game/src/PreloadState.js", "game/src/ScreenshotState.js", "game/src/Message.js", "game/src/Snowman.js", "game/src/Fuel.js", "game/src/Player.js", "game/src/Boss.js" ]
        }
      }
    },

    "copy": {
      index: {
        src: 'game/index-build.html',
        dest: 'build/index.html'
      },
      gfx: {
        expand: true,
        cwd: 'game',
        src: 'assets/gfx/atlas/*',
        dest: 'build/'
      },
      snd: {
        expand: true,
        cwd: 'game',
        src: 'assets/sfx/*',
        dest: 'build/'
      },
      fnt: {
        expand: true,
        cwd: 'game',
        src: 'assets/fnt/*',
        dest: 'build/'
      },
      css: {
        expand: true,
        cwd: 'game',
        src: 'assets/css/*',
        dest: 'build/'
      },
      phaser: {
        src: 'game/lib/phaser.min.js',
        dest: 'build/phaser.min.js'
      }
    },

    "zip": {
      "node-webkit": {
        cwd: 'build/',
        src: ['build/**'],
        dest: 'build/<%= pkg.name %>.zip'
      }
    },

    "connect": {
      server: {
        options: {
          port: 8080,
          keepalive: true,
          open: 'http://localhost:8080/game/'
        }
      }
    },

    "atlas": {
      sprites: {
        options: {
          src: "game/assets/gfx/sprites/*.png",
          name: "sprites",
          path: "game/assets/gfx/atlas/",
          format: "json",
          powerOfTwo: true,
          padding: 1
        }
      },
      preloader: {
        options: {
          src: "game/assets/gfx/preloader/*.png",
          name: "preloader",
          path: "game/assets/gfx/atlas/",
          format: "json",
          powerOfTwo: true,
          padding: 1
        }
      }
    },

    "clean": {
      build: [ 'build/', 'game/assets/gfx/atlas/' ]
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Task to build a texture atlas (spritesheet-js)
  // https://github.com/krzysztof-o/spritesheet.js
  // https://www.npmjs.org/package/spritesheet-js
  grunt.task.registerMultiTask('atlas', 'Generate texture atlas', function() {
    var done = this.async(); // Force into async mode and return handle to done() function

    var options = this.options();

    // Build new atlas
    var spritesheet = require('spritesheet-js');
    spritesheet(options.src, options, function (err) {
      if (err) throw err;
      console.log("Generated " + options.name + ".json");
      done(); // Call done() when the async spritesheet generator is finished
    });
  });

  // Default task(s).
  grunt.registerTask('default', ['clean:build', 'atlas', 'uglify', 'copy', 'zip']);

};
