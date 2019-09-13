<div align="center">
  <a href="https://www.npmjs.com/package/flamebird">
    <img width="250" height="210" src="https://github.com/acacode/flamebird/raw/develop/client/assets/logo.png">
  </a>
  <br>
  <br>


  <br>
<a href="https://github.com/acacode/flamebird/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-red.svg?style=flat-square"></a><a href="https://www.npmjs.com/package/flamebird"><img src="https://img.shields.io/npm/v/flamebird.svg?style=flat-square"></a><a href="https://travis-ci.org/acacode/flamebird"><img src="https://img.shields.io/travis/acacode/flamebird.svg?style=flat-square"></a><a href="http://npm-stat.com/charts.html?package=flamebird"><img src="https://img.shields.io/npm/dm/flamebird.svg?style=flat-square"></a><a href="https://www.codefactor.io/repository/github/acacode/flamebird/overview/develop"><img src="https://www.codefactor.io/repository/github/acacode/flamebird/badge/develop?style=flat-square"></a>
<h1>🔥 flamebird 🔥</h1>
  <p>
    the nodejs task manager for Procfile-based or npm-based applications
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


<h3>How it looks:</h3>

![](assets/web-ui-screen.png)



## Contribution  


If you want to help this project you need to read this part of readme.md for more detail understanding of for what some things are needed.  

First of all take a look at project structure:  

- **flamebird project**
  - [flamebird.js](./flamebird.js) - Executable by nodejs file when call `fb start`/`fb web`. Describe information about commands `web` and `start`.
  - [LICENSE](./LICENSE)
  - [nodemon.json](./nodemon.json) - Nodemon config file. Only needed for debug flamebird.
  - [node_modules](./node_modules) - you know what is that :D
  - [package-lock.json](./package-lock.json)
  - [package.json](./package.json)
  - [postinstall.js](./postinstall.js) - Script which execute after installing flamebird dependencies
  - [Procfile](./Procfile) - List of scripts which execute via nodemon. Only needed for debug flamebird.
  - [README.md](./README.md)
  - [webpack.config.js](./webpack.config.js)
  - [babel.config.js](./babel.config.js)
  - [CHANGELOG.md](./CHANGELOG.md)
  - __assets__
    - [task_button.png](./assets/task_button.png)
    - [hotkeys_button.png](./assets/hotkeys_button.png)
    - [web-ui-screen.png](./assets/web-ui-screen.png)
  - __client__ Client application ⚡️
    - __controllers__ - folder with controllers where each one have specific UI manipulations  
      - [Header.js](./client/controllers/Header.js)
    - __assets__ - folder with assets
      - [logo.psd](./client/assets/logo.psd) - source of the flamebird logo  
      - [logo.png](./client/assets/logo.png)
      - [logo2_small.png](./client/assets/logo2_small.png)
      - [logo2.png](./client/assets/logo2.png)
      - [logo2_transparent.png](./client/assets/logo2_transparent.png)
    - __helpers__ - folder with helpers where helper contains specific logic. In future it will be removed or moved into modules in `scripts` folder.
      - [dom_utils.js](./client/helpers/dom_utils.js)
      - [hotKeys.js](./client/helpers/hotKeys.js)
      - [tabs.js](./client/helpers/tabs.js)
      - [taskList.js](./client/helpers/taskList.js)
      - [WindowAttached.js](./client/helpers/WindowAttached.js)
    - [global.js](./client/global.js) - global file which implement pattern Facade and combine all interactions of modules from `scripts` folder.  
    - [index.html](./client/index.html)
    - [medium-screens.css](./client/medium-screens.css)
    - __scripts__ - Bunch of modules which needed for web application.
      - [Api.js](./client/scripts/Api.js) - Contains all API endpoints which needed for client. It uses `kinka` as http web client.
      - [Configs.js](./client/scripts/Configs.js) - Responsible for update configs list
      - [HotKeys.js](./client/scripts/HotKeys.js) - Hot keys
      - [Tabs.js](./client/scripts/Tabs.js) - Module which responsible for update tabs list. 
      - [TaskList.js](./client/scripts/TaskList.js) - Module which responsible for update tasks list.
      - [ThemeSwitcher.js](./client/scripts/ThemeSwitcher.js) - Module which responsible for theme switching.
      - [WebLogger.js](./client/scripts/WebLogger.js) - Logger module. Output logs into the logs container
      - [WebSocket.js](./client/scripts/WebSocket.js) - WebSocket client connection
    - [small-screens.css](./client/small-screens.css)
    - __styles__
      - [dark-theme.css](./client/styles/dark-theme.css)
      - [fullscreen.css](./client/styles/fullscreen.css)
      - [hot_keys-shortcuts.css](./client/styles/hot_keys-shortcuts.css)
    - [styles.css](./client/styles.css)
  - __dist__ - client build folder
  - __server__  Server application ⚡️
    - [config.js](./server/config.js) - module which working with configuration file (`.flamebirdrc`)  
    - [constants.js](./server/constants.js) - module which contains constant values. It usings on both sides (client, server)
    - [processWorker.js](./server/processWorker.js) - module which responsible for run/stop tasks
    - [server.js](./server/server.js) - [`Web version`] module which contains API endpoints.
    - __utils__ - bunch of utilities 😊
      - [colors.js](./server/utils/colors.js) - tools which colorize console output
      - [commands.js](./server/utils/commands.js) - tools which needed for CRUD commands
      - [emitter.js](./server/utils/emitter.js) - instance of `events.EventEmitter`. 
      - [envs.js](./server/utils/envs.js) - tools which needed for parse environment variables
      - [mem_cache.js](./server/utils/mem_cache.js) - just simple object which save all information. Have methods `get`, `set`
      - [processes.js](./server/utils/processes.js) - tools which needed for create and kill processes
    - [ws.js](./server/ws.js) - [`Web version`] Websocket connection
    - [taskfile.js](./server/taskfile.js) - module which parse all commands from `Procfile` and `package.json`





## 📝 License

Licensed under the [MIT License](./LICENSE).

