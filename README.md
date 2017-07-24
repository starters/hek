## hêk

Kickstart your new projects with one command. ![Screenshot](https://cldup.com/IX1JbAl6AQ.png)

## Install

```bash
$ npm install -g hek/hek
```

## The Goal

My goal with this project is to save as much developer time as possible. I imagined a tool that can learn how to help a developer to write code. 

In other words, we teach computers how to write code, instead of writing it ourselves. And we can accomplish this by creating templates of small or large chunks of code and building a UI that allows the developer to insert these templates via human friendly UIs, as in the screenshot above.

## What is missing ?

* Letting extensions register sub-commands: this will allow us to insert project-specific templates. 
* Extending CLI to support sub-commands: so we can run commands like `hek :add-route`. [more examples](https://github.com/starters/redux-starter#usage)

## Usage

Hek is a command-line tool and a library for creating projects by using starters.
It'll save your time from initializing projects from scratch, letting you choose
what kind of project that you'd like to choose. It's designed not only for JavaScript,
you can use it for creating any project by choosing or creating a starter.

## Command-line

After installing it, you can simply call it on command-line to start your next project:

```bash
$ hek
```

It'll prompt you some basic questions like your Github handle, where you keep your code for once,
and some project specific questions like its name, Github URL etc.

## Programmatical Interface

See `examples/programmatical.js` for how to use hek programmatically.
