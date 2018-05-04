<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="250" height="210" src="https://github.com/js2me/flamebird/raw/release/1.7.0/lib/app/logo.png">
  </a>
  <br>
  <br>


  <br>
	<a href="https://github.com/js2me/flamebird/blob/master/LICENSE">
		<img src="https://img.shields.io/badge/license-MIT-red.svg">
	</a>
	<a href="https://www.npmjs.com/package/flamebird">
		<img src="https://img.shields.io/npm/v/flamebird.svg?style=flat">
	</a>
  <h1>Flamebird.js</h1>
  <p>
    Flamebird is a nodejs task manager for Procfile-based or npm-based applications
  </p>
</div>

<h2 align="center">Installation</h2>

    $ npm install -g flamebird

## Get usage

    $ fb --help

## Usage

Flamebird can be run using `fb` keyword or a little larger `flamebird` keyword.
You can use command `fb start` or `fb web`

### command: fb start

Run tasks from `Procfile` or `package.json` 

Options:
- `-p, --package` - using package.json for the managing tasks. (WARNING: only command `start` run all tasks from `package.json`, for resolving it , please use option `-t`)
- `-t, --tasks [tasks]` - list of tasks which will be run `fb start` ( example : `fb start --tasks start,start:dev,start-server` and will be run tasks `start`,`start:dev`,`start-server` )

### command: fb web

Launch web-applcation which is task-manager. This command has more opportunities then `start`. Web-application read `Procfile` and `package.json` together and adding ability switching between them

Options:
- `-t, --tasks [tasks]` - list of tasks which will be managing in the `fb web` command ( example : `fb web --tasks start,start:dev,start-server` and this tasks will be showing in the web-application `start`,`start:dev`,`start-server` )
- `-p, --port <PORT>` - sets the server port, by default `5050`
- `-n, --name <NAME>` - sets the project name. Display name of the project in title and header.