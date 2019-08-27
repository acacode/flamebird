
# Changelog


## [3.0.0-alpha] - {date}  

### Added
- `web` [internal] changed webpack configuration for web client  
- `web` new options:  
    - `-i, --ignore-pms` (in previous version it uses by default)  
        Allows to launch tasks without yarn or npm ( use absolute paths: webpack -> node_modules/.bin/webpack )  
        default: `false`  
    - `-u, --use-another-pm <NAME>` (works only with `-i` flag)  
        Allows to use another package manager for launch tasks. By default will use npm ( For example: -y yarn )  
        default: `'npm'`  
    - `-w, --without-browser`  
        This option disable opening the new tab in Google Chrome browser  
        default: `false`  
    - `-s, --sort-by-name`  
        This option using to sort all commands by name (asc)  
        default: `false`  
- `cmd` new options:  
    - `-i, --ignore-pms` (in previous version it uses by default)  
        Allows to launch tasks without yarn or npm ( use absolute paths: webpack -> node_modules/.bin/webpack )  
        default: `false`  
    - `-u, --use-another-pm <NAME>` (works only with `-i` flag)  
        Allows to use another package manager for launch tasks. By default will use npm ( For example: -y yarn )  
        default: `'npm'`  

### Changed
- [internal] fully refactored code on nodeJS and web view  

### Fixed  
- Problems linked with running flamebird without `node_modules` folder  

### Removed  
- Removed default usage experimental converting npm/yarn run scripts to the absolute paths  


## [2.1.4] - 12/06/2018

### Added
- `web` hotkey feautures
    - <kbd>DEL</kbd> Clear logs in selected task
    - <kbd>&uparrow;</kbd> Partially scroll up logs in selected task
    - <kbd>&downarrow;</kbd> Partially scroll down logs in selected task
    - <kbd>SHIFT</kbd> + <kbd>A</kbd> Run all tasks
    - <kbd>SHIFT</kbd> + <kbd>S</kbd> Stop all tasks
    - <kbd>SHIFT</kbd> + <kbd>&uparrow;</kbd> Fully scroll up logs in selected task
    - <kbd>SHIFT</kbd> + <kbd>&downarrow;</kbd> Fully scroll down logs in selected task
- `web` browser notifications about updates of the running tasks
- `web` mobile version

### Changed
- added emojis to `README.md`
- added documentation for hotkeys


### Fixed
- typo fixes in `README.md`


## [2.0.0] - 12/01/2018

### Changed
- `web` replaced web http-client `axios` to `kinka`

### Fixed
- `web` big line height between lines
- `web` unique task ids
- `web` unique websocket session ids

## [1.8.6]

### Changed
- `web` - [Internal] - migrated client code to ES6

### Fixed
- bug - [Cannot find module 'commander'](https://github.com/acacode/flamebird/issues/49)

## [1.8.5]

### Changed
- replaced `var` operator to ES6 `const`/`let`

### Fixed
- text corrections in `README.md`
- removed not needed dependencies and updated project version in `package-lock.json`

## [1.8.4--fix]

### Fixed
- bugs with tasks using `cross-env` utility

## [1.8.3--fix]

### Fixed
- `web` - bug with `Keyboard.connect is not a function`
- absolute paths for npm tasks

## [1.8.02]

### Fixed
- `web` - a small fixes in layout of the web page

## [1.8.0]

### Fixed
- maximum `killall` event listeners. The removing of the `killall` event listener if task is completed
- `web` - more than one websocket clients
- `web` - restart of the task has been fixed
- `start` - not all processes was launched from Procfile using `start` command


### Changed
- `web` - a small UI/UX fixes.

### Removed
- `web` - `blue` theme

## [1.7.91 - 1.7.94]

### Fixed
- `web` - Fix displaying logs for non active task in the active task
- `web` - Fix problem with changing env variables in web (previous process not killed)
- Remove unsupportable spread operator

## [1.7.9]

### Fixed
- `web` - Cannot switch to `npm` tab [32 issue](https://github.com/acacode/flamebird/issues/32)
- `web` - Cannot read property `isActive` of undefined [30 issue](https://github.com/acacode/flamebird/issues/30)

## [1.7.8]

### Added
- Running commands without `yarn`/`npm run`. Launching libraries in the commands via full path to library (util -> node_modules/.bin/util)[14 issue](https://github.com/acacode/flamebird/issues/14) & [25 issue](https://github.com/acacode/flamebird/issues/25)
- Integration with Travis CI [17 issue](https://github.com/acacode/flamebird/issues/17)

### Fixed
- `web` - Fixed whitespace in the logs [26 issue](https://github.com/acacode/flamebird/issues/26)

## [1.7.5]

### Added
- Ability of the parsing and displaying `.env` file [20 issue](https://github.com/acacode/flamebird/issues/20)

### Changed
- [Internal] FE/BE code refactoring
- `web` - changes in webpack config. Add builds for `*.css` files
- add post install script ( only decorations )
- `web` - Fix styles for small screens and for fullscreen mode.

### Fixed
- Displaying logs not linked with opened task in web [21 issue](https://github.com/acacode/flamebird/issues/21)

## [1.7.1 - 1.7.31]

### Fixed
- fixed webpack build after installing npm packages

## [1.7.0] - 13/05/2018

### Changed
- refactoring code in frontend part of application
- update styles for web application

### Fixed
- loosing colors in logs [18 issue](https://github.com/acacode/flamebird/issues/18)
- problems with running webpack-dev-server in flamebird [15 issue](https://github.com/acacode/flamebird/issues/15)

### Added
- `web` - added hotkeys button. Which helps task switching or tabs switching via keyboard
- `web` - added themes [default(white), dark, blue]
- `web` - added fullscreen button. Changes task runner window size
- `web` - webpack build
- `web` - create flamebird logo [16 issue](https://github.com/acacode/flamebird/issues/16)
- `web` - ability of the renaming values of the env variables [13 issue](https://github.com/acacode/flamebird/issues/13)

## [1.6.7] -

### Changed
- renaming option `-P` to `-p` in the `web` command, for the setting port
- update styles for web application

### Added
- `web` - added autoscroll button on the right bottom side. For turning on/off autoscrolling logs to bottom
- `web` - [dev only] function for colorizing specific words like so `[emitted]`, `[built]` etc.
- `web` - flamebird can read and procfile and package.json together, and added ability switching between this files in the web-application

### Removed
- removed option `-p, --package`

## [1.5.5] - 04/23/2018

### Changed
- working status of the tasks dependent on the server's status of task
- updated README.md

### Fixed
- Normalized showing logs of the task
- Envs isn't passing to the command [BUG](https://github.com/acacode/flamebird/issues/3)
- fb web: UnhandledPromiseRejectionWarning: Error: spawn chrome ENOENT [BUG](https://github.com/acacode/flamebird/issues/2)


## [1.5.3] - 04/21/2018

### Added
- option `-n, --name <NAME>` for the `web` command. Sets the name of application
- added feature of the opening new tab of Google Chrome browser when we launch `web` command 

### Changed
- update styles for web application
- route `commands` renamed to `info` and now returns object with properties `appName` and `commands`


## [1.5.0] - 04/21/2018

### Added
- `fb` - additional command name for the calling flamebird
- command `flamebird web` - launch webview of flamebird application and working with all processes from webview 
- option `-p, --package` for commands `start` and `web` which needs for using `package.json` as the managing tasks instead of `Procfile`
- option `-t, --tasks [tasks]` for commands `start` and `web` which needs for setting specific tasks which needs to the working
- option `-P, --port <PORT>` for `web` command. Sets the server port. By default 5050 value


## [1.0.0] - 04/18/2018

### Added
- command `flamebird start` for the launching all commands in Procfile
- option `-j, --procfile <FILE>` for the loading `Procfile` from `<FILE>` . by default using `./Procfile` path