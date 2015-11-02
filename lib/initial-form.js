var NewForm = require("cli-form");

module.exports = NewForm('~/.kik/kik.json', [
  { key: 'github', title: "What's your Github handle?",  default: process.env.USER, forOnce: true },
  { key: 'workspace', title: 'Where do you keep your code locally?', default: process.cwd(), forOnce: true },
  { key: 'name', title: "Project Name:", desc: 'e.g  hello-world', expect: { len:[1] } },
  { key: 'folder', title: 'Project Folder:', default: '{workspace}/{name}', expect: { len: [1] } },
  { key: 'remote', title: 'Git remote?', desc: 'username/repo', default: 'git@github.com:{github}/{name}.git', expect: { len: [3] } },
  { key: 'starters', title: "Starter(s):", desc: 'e.g: redux-starter, go-api-starter', default: '', commaList: true }
]);
