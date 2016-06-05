var test = require("prova");
var path = require("path");
var NewProject = require("../lib/project");
var NewNPMStarter = require('../examples/npm-starter');

test('initializing a new project', function (t) {
  t.plan(6);

  var p = NewProject({
    name: 'yolo',
    folder: '/tmp/yolo',
    starters: [require('../examples/npm-starter')],
    remote: 'azer/yolo'
  });

  t.equal(p.name, 'yolo');
  t.equal(p.folder, '/tmp/yolo');
  t.equal(p.starters[0].project, p);
  t.equal(p.remote, 'azer/yolo');
  t.notOk(p.context);

  p = NewProject({
    'name': 'yolo'
  });

  t.deepEqual(p.starters, []);
});

test('prefixing objects', function (t) {
  t.plan(1);

  var p = NewProject({
    name: 'yolo',
    folder: '/tmp/yolo',
    remote: 'azer/yolo'
  });

  var obj = {
    yo: 'lo',
    foo: 'bar'
  };

  t.deepEqual(p.prefix('=> ', obj), {
    '=> yo': 'lo',
    '=> foo': 'bar'
  });
});

test('context', function (t) {
  t.plan(4);

  var p = NewProject({
    name: 'yolo',
    folder: '/tmp/yolo',
    remote: 'azer/yolo',
    context: {
      'yo': 'lo'
    }
  });

  p.context.foo = 'bar';

  var vars = p.variables();
  t.equal(vars['hek:name'], 'yolo');
  t.equal(vars['hek:folder'], '/tmp/yolo');
  t.equal(vars['hek:remote'], 'git@github.com:azer/yolo.git');
  t.equal(vars['hek:yo'], 'lo');
});

test('context with starters', function (t) {
  t.plan(20);

  var p = NewProject({
    name: 'yolo',
    folder: '/tmp/yolo',
    remote: 'azer/yolo',
    starters: [NewNPMStarter],
    context: {
      'yo': 'lo'
    }
  });

  p.starters[0].context = {
    desc: "let's go somewhere",
    test: "npm yo"
  };

  var vars = p.variables();
  t.equal(vars['hek:name'], 'yolo');
  t.equal(vars['hek:folder'], '/tmp/yolo');
  t.equal(vars['hek:remote'], 'git@github.com:azer/yolo.git');
  t.equal(vars['hek:yo'], 'lo');
  t.equal(vars['hek:variableName'], 'yolo');
  t.equal(vars['hek:className'], 'Yolo');
  t.equal(vars['hek:slug'], 'yolo');
  t.equal(vars['hek:title'], 'Yolo');

  vars = p.starters[0].variables();

  t.equal(vars['hek:name'], 'yolo');
  t.equal(vars['hek:folder'], '/tmp/yolo');
  t.equal(vars['hek:remote'], 'git@github.com:azer/yolo.git');
  t.equal(vars['hek:yo'], 'lo');
  t.equal(vars['hek:variableName'], 'yolo');
  t.equal(vars['hek:className'], 'Yolo');
  t.equal(vars['hek:slug'], 'yolo');
  t.equal(vars['hek:title'], 'Yolo');
  t.equal(vars['hek:npm:name'], 'npm');
  t.equal(vars['hek:npm:folder'], path.join(__dirname, '../examples/npm-starter/files'));
  t.equal(vars['hek:npm:desc'], "let's go somewhere");
  t.equal(vars['hek:npm:test'], 'npm yo');
});
