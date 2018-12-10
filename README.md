<div align="center">
  <a href="https://www.npmjs.com/package/flamebird">
    <img width="250" height="210" src="https://github.com/acacode/flamebird/raw/master/lib/app/logo.png">
  </a>
  <br>
  <br>


  <br>
<a href="https://github.com/acacode/flamebird/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-red.svg?style=flat-square"></a><a href="https://www.npmjs.com/package/flamebird"><img src="https://img.shields.io/npm/v/flamebird.svg?style=flat-square"></a><a href="https://travis-ci.org/acacode/flamebird"><img src="https://img.shields.io/travis/acacode/flamebird.svg?style=flat-square"></a><a href="http://npm-stat.com/charts.html?package=flamebird"><img src="https://img.shields.io/npm/dm/flamebird.svg?style=flat-square"></a><a href="https://www.codefactor.io/repository/github/acacode/flamebird/overview/develop"><img src="https://www.codefactor.io/repository/github/acacode/flamebird/badge/develop?style=flat-square"></a>
<h1>🔥 flamebird 🔥</h1>
  <p>
    the nodejs task manager for Procfile based or npm based applications
  </p>
</div>

## 🚀 Installation

    $ npm install -g flamebird

## 📄 Usage

To start Flamebird you can use `fb [command] [options]` (or longer alias `flamebird [command] [options]`).<br>
Application provides two commands: `fb start` and `fb web` (read below).

Need help? Use command:

    $ fb --help
    # or simply
    $ fb

## 💻 Console version (`fb start`)

    $ fb start [options]

Run tasks from `Procfile` or `package.json` 

Options:
- `-p, --package` - using package.json for the managing tasks. (:warning: with this option the command `start` run all tasks from `package.json`, for resolving it , please use option `-t`)
- `-t, --tasks [tasks]` - list of tasks which needs to async run in `fb start` ( example : `fb start --tasks start,start:dev,start-server` and then tasks are `start`,`start:dev`,`start-server` will have been runned asynchronously )

## 💻 Web version (`fb web`)

    $ fb web [options]

Launch web-application which is task-manager. That command has more abilities than `start`. Web-application is reading `Procfile` and `package.json` and adding ability to launch scripts inside this files together

Options:
- `-t, --tasks [tasks]` - list of tasks which will be managing in the `fb web` command ( example : `fb web --tasks start,start:dev,start-server` and this tasks will be showing in the web-application `start`,`start:dev`,`start-server` )
- `-p, --port <PORT>` - sets the server port, by default `5050`
- `-n, --name <NAME>` - sets the project name. Display name of the project in title and header. By default using name of project inside `package.json` otherwise `flamebird`

<h3>hotkeys</h3>

hotkeys works only if ![hotkeys button](./assets/hotkeys_button.png) is triggered.

hotkey | action
------------ | -------------
<kbd>Q</kbd>,<kbd>W</kbd>,<kbd>E</kbd>...<kbd>M</kbd>,<kbd>&lt;</kbd>,<kbd>&gt;</kbd>,<kbd>/</kbd> | Open task which assigned to specific key. ![example](./assets/task_button.png)
<kbd>SHIFT</kbd> + <kbd>R</kbd> | Run/Stop selected task.
<kbd>TAB</kbd> | Switch between `Procfile` and `package.json` tabs
<kbd>DEL</kbd> | Clear logs in selected task
<kbd>&uparrow;</kbd> | Partially scroll up logs in selected task
<kbd>&downarrow;</kbd> | Partially scroll down logs in selected task
<kbd>SHIFT</kbd> + <kbd>&uparrow;</kbd> | Fully scroll up logs in selected task
<kbd>SHIFT</kbd> + <kbd>&downarrow;</kbd> | Fully scroll down logs in selected task
<kbd>SHIFT</kbd> + <kbd>A</kbd> | Run all tasks
<kbd>SHIFT</kbd> + <kbd>S</kbd> | Stop all tasks

## 📝 License

Licensed under the [MIT License](./LICENSE).

