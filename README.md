# Flamebird.js
Flamebird is a nodejs task manager for Procfile-based or npm-based applications

## Installation

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