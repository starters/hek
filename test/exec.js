var test = require("prova");
var exists = require("fs").existsSync;
var exec = require("../lib/exec");

test('templating with numbers', function (t) {
  t.plan(4);

  var files = randomFilenames('/tmp/', 3);

  exec('touch {0} {1} {2}', files[0], files[1], files[2], function (error) {
    t.error(error);
    t.ok(exists(files[0]));
    t.ok(exists(files[1]));
    t.ok(exists(files[2]));
  });
});

test('templating with objects', function (t) {
  t.plan(4);

  var files = randomFilenames('/tmp/', 3);

  exec('touch {a} {b} {c}', { a: files[0], b: files[1], c: files[2] }, function (error) {
    t.error(error);
    t.ok(exists(files[0]));
    t.ok(exists(files[1]));
    t.ok(exists(files[2]));
  });
});

test('specifying a folder to run the command', function (t) {
  t.plan(4);

  var files = randomFilenames(3);

  exec.at('/tmp')('touch {a} {b} {c}', { a: files[0], b: files[1], c: files[2] }, function (error) {
    t.error(error);
    t.ok(exists('/tmp/' + files[0]));
    t.ok(exists('/tmp/' + files[1]));
    t.ok(exists('/tmp/' + files[2]));
  });
});

function randomFilenames (prefix, n) {
  return Array.apply(null, { length: n }).map(function (n) {
    return prefix + 'kik-exec-test-' + Math.floor(Math.random() * 99999999);
  });
}
