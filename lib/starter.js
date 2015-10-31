var debug = require("local-debug")('starter');
var struct = require("new-struct");
var loop = require("serial-loop");
var format = require("format-text");
var path = require("path");
var fs = require("fs");
var mix = require("mix-objects");

var Starter = struct({
  copy: copy,
  prefix: prefix,
  render: render,
  variables: variables
});

module.exports = NewStarter;
module.exports.Starter = Starter;

function NewStarter () {
  return Starter({
    name: 'unknown-starter'
  });
}

function prefix (starter, str, obj) {
  return starter.project.prefix('kik:' + str, obj);
}

function variables (starter) {
  var p = starter.project.variables();
  var s = starter.prefix(starter.name + ':', mix({}, [starter.context, {
    name: starter.name,
    folder: starter.folder
  }]));

  return mix(p, [s]);
}

function copy (starter, folder, callback) {
  debug('Copying from starter "%s" to project "%s"', starter.folder, starter.project.folder);
  starter.project.exec('cp -r {0}/. .', folder, callback);
}

function render (starter, files, callback) {
  loop(files.length, each, callback);

  function each (done, index) {
    var filename = path.join(starter.project.folder, files[index]);
    debug('Rendering %s', filename);

    fs.readFile(filename, function (error, content) {
      if (error) return done(error);

      fs.writeFile(filename, format(content, formatVars(starter.variables())), done);
    });
  }
}

function formatVars (obj) {
  var result = {};
  var key;

  for (key in obj) {
    if (typeof obj[key] == 'object') {
      result[key] = JSON.stringify(obj[key], null, '  ');
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}
