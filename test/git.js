var test = require("prova");
var exec = require("child_process").exec;
var fs = require("fs");
var git = require("../lib/git");

test('normalize', function (t) {
  t.plan(4);
  t.equal(git.normalize('azer/foobar'), 'git@github.com:azer/foobar.git');
  t.equal(git.normalize('git@github.com:azer/foobar.git'), 'git@github.com:azer/foobar.git');
  t.equal(git.normalize('https://github.com/azer/foobar'), 'https://github.com/azer/foobar');
  t.equal(git.normalize('http://github.com/azer/foobar'), 'http://github.com/azer/foobar');
});

test('init', function (t) {
  t.plan(2);
  var p = '/tmp/hek-test-' + Math.floor(Math.random() * 999999);

  exec('mkdir -p ' + p, function (error) {
    git.init(p, function (error) {
      t.error(error);
      t.ok(fs.existsSync(p + '/.git'));
    });
  });
});
