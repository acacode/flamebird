const MESSAGE_TYPES = {
  CONNECTION: 'CONNECTION',
  LOG: 'LOG',
}

const PATHS = {
  // paths will been resolved via path.resolve(__dirname)
  WEB_APP_ROOT: '../dist',
  WEB_APP_HTML: '../dist/index.html',
}

const TASK_RUNNERS = {
  NPM: 'npm run',
  YARN: 'yarn run',
}

module.exports = {
  MESSAGE_TYPES,
  PATHS,
  TASK_RUNNERS,
}
