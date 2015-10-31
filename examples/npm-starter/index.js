var struct = require("new-struct");
var path = require("path");
var Starter = require("kik-starter");

var folder = path.join(__dirname, 'files');
var form = [
  { key: 'desc', title: 'Describe your project' },
  { key: 'keywords', title: 'Keywords', desc: 'Separate with comma', commaList: true },
  { key: 'test', title: 'Test command', default: 'node test' }
];

debugger;

var NPMStarter = struct(Starter, {
  start: start
});

module.exports = NewNPMStarter;

function NewNPMStarter (project) {
  return NPMStarter({
    name: 'npm',
    project: project,
    folder: folder,
    form: form
  });
}

function start (starter, callback) {
  debugger;

  starter.copy(folder, function (error) {
    starter.render(['README.md', 'package.json'], callback);
  });
}
