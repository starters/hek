var NewForm = require("cli-form");

module.exports = NewForm('~/.kik/kik.json', [
  { key: 'github', title: "What's your Github handle?",  default: process.env.USER, forOnce: true },
  { key: 'workspace', title: 'Where do you keep your code locally?', default: process.cwd(), forOnce: true },
  { key: 'name', title: "What's the name of your new project?", desc: 'e.g  hello-world', expect: { len:[1] } },
  { key: 'folder', title: 'Where should this project live in?', default: '{workspace}/{name}', expect: { len: [1] } },
  { key: 'remote', title: 'Git remote?', desc: 'username/repo', default: 'git@github.com:{github}/{name}.git', expect: { len: [3] } },
  { key: 'starters', title: "Which starter(s) would you like to choose?", desc: 'NPM modules, comma separated. e.g kik-npm-starter, kik-go-starter', commaList: true }
]);
