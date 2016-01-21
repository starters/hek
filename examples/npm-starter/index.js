"use strict"

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
    this.serially()
      .run(this.copy.bind(this), [folder])
      .then(this.render.bind(this), ['README.md', 'package.json'])
      .done(callback);
  }
}

module.exports = NPMStarter;
