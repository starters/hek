var kik = require('../');
var npm = require("./npm-starter");

var myproject = kik({
  name: 'yolo',
  folder: '/tmp/yolo',
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
