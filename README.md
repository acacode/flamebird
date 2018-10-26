<div align="center">
  <a href="https://www.npmjs.com/package/flamebird">
    <img width="250" height="210" src="https://github.com/acacode/flamebird/raw/master/lib/app/logo.png">
  </a>
  <br>
  <br>


  <br>
	<a href="https://github.com/acacode/flamebird/blob/master/LICENSE">
		<img src="https://img.shields.io/badge/license-MIT-red.svg">
	</a>
	<a href="https://www.npmjs.com/package/flamebird">
		<img src="https://img.shields.io/npm/v/flamebird.svg?style=flat">
	</a>
	<a href="https://travis-ci.org/acacode/flamebird">
		<img src="https://travis-ci.org/acacode/flamebird.svg?branch=master">
	</a>
  <h1>Flamebird.js</h1>
  <p>
    Flamebird is a nodejs task manager for Procfile-based or npm-based applications
  </p>
</div>

<h2 align="left">Installation</h2>

    $ npm install -g flamebird

<h2 align="left">Get usage</h2>

    $ fb --help

<h2 align="left">Usage</h2>

Flamebird can be run using `fb` keyword or a little larger `flamebird` keyword.
You can use command `fb start` or `fb web`

<h3 align="left">command: fb start</h2>

    $ fb start [options]

Run tasks from `Procfile` or `package.json` 

Options:
- `-p, --package` - using package.json for the managing tasks. (WARNING: with this option the command `start` run all tasks from `package.json`, for resolving it , please use option `-t`)
- `-t, --tasks [tasks]` - list of tasks which needs to async run in `fb start` ( example : `fb start --tasks start,start:dev,start-server` and then tasks are `start`,`start:dev`,`start-server` will have been runned asynchronously )

<h3 align="left">command: fb web</h2>

    $ fb web [options]

Launch web-application which is task-manager. That command has more abilities than `start`. Web-application is reading `Procfile` and `package.json` and adding ability to launch scripts inside this files together

Options:
- `-t, --tasks [tasks]` - list of tasks which will be managing in the `fb web` command ( example : `fb web --tasks start,start:dev,start-server` and this tasks will be showing in the web-application `start`,`start:dev`,`start-server` )
- `-p, --port <PORT>` - sets the server port, by default `5050`
- `-n, --name <NAME>` - sets the project name. Display name of the project in title and header. By default using name of project inside `package.json` otherwise `flamebird`