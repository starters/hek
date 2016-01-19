var Project = require('../');
var npm = require("./npm-starter");

var myproject = new Project({
  name: 'yolo',
  folder: '/tmp/yolo',
  //starters: [{ module: npm, subfolder: 'ui' }],
  starters: [npm],
  remote: 'azer/yolo',
  context: {
    github: 'azer'
  }
});

myproject.starters[0].context = {
  'keywords': ['yolo', 'travel'],
  'test': 'node test',
  'desc': "let's go somewhere"
};

myproject.create(function (error) {
  if (error) throw error;
  console.log('done');
});
