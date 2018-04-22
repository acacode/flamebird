
# Changelog


## [1.5.5] - 2018-04-23

### Changed
- working status of the tasks dependent on the server's status of task
- updated README.md

### Fixed
- Normalized showing logs of the task
- Envs isn't passing to the command [BUG](https://github.com/js2me/flamebird/issues/3)
- fb web: UnhandledPromiseRejectionWarning: Error: spawn chrome ENOENT [BUG](https://github.com/js2me/flamebird/issues/2)


## [1.5.3] - 2018-04-21

### Added
- option `-n, --name <NAME>` for the `web` command. Sets the name of application
- added feature of the opening new tab of Google Chrome browser when we launch `web` command 

### Changed
- update styles for web application
- route `commands` renamed to `info` and now returns object with properties `appName` and `commands`


## [1.5.0] - 2018-04-21

### Added
- `fb` - additional command name for the calling flamebird
- command `flamebird web` - launch webview of flamebird application and working with all processes from webview 
- option `-p, --package` for commands `start` and `web` which needs for using `package.json` as the managing tasks instead of `Procfile`
- option `-t, --tasks [tasks]` for commands `start` and `web` which needs for setting specific tasks which needs to the working
- option `-P, --port <PORT>` for `web` command. Sets the server port. By default 5050 value


## [1.0.0] - 2018-04-18

### Added
- command `flamebird start` for the launching all commands in Procfile
- option `-j, --procfile <FILE>` for the loading `Procfile` from `<FILE>` . by default using `./Procfile` path