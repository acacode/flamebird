const MESSAGE_TYPES = {
  CONNECTION: 'CONNECTION',
  LOG: 'LOG',
  APPS_LIST_UPDATE: 'APPS_LIST_UPDATE',
}

const PATHS = {
  // paths will been resolved via path.resolve(__dirname)
  WEB_APP_ROOT: '../dist',
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
