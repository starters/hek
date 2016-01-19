"use strict"

var struct = require("new-struct");
var path = require("path");
var Starter = require("kik-starter");

var folder = path.join(__dirname, 'files');
var form = [
  { key: 'desc', title: 'Describe your project' },
  { key: 'keywords', title: 'Keywords', desc: 'Separate with comma', commaList: true },
  { key: 'test', title: 'Test command', default: 'node test' }
];

class NPMStarter extends Starter {
  constructor (project) {
    super('npm', project, folder, form);
  }

  start (callback) {
    var self = this;

    this.copy(folder, function (error) {
      self.render(['README.md', 'package.json'], callback);
    });
  }
}

module.exports = NPMStarter;
