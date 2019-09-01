const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const memCache = require('./mem_cache')
const { MESSAGE_TYPES, sendMessage } = require('../ws')
const { separateEnvsFromString } = require('./envs')

const getCommandById = id => _.find(memCache.get('commands', []), { id }) || {}

/**
 * @typedef {Object} Command
 * @property {string} task
 * @property {Object} envs
 * @property {string} name
 */

const createCommand = (name, commandData, type) => {
  const commonData = separateEnvsFromString(commandData)
  return {
    task: commonData.string,
    envs: commonData.envs,
    name: name,
    logs: [],
    isRun: false,
    id: `c${uuidv1().replace(/-/g, '')}`,
    type,
  }
}

const updateCommand = (taskId, { isRun, isLaunching, isStopping, log }) => {
  const command = getCommandById(configId, taskId)
  const message = {
    name: command.name,
    isRun: command.isRun,
    type: command.type,
    id: taskId,
  }
  if (!_.isUndefined(isLaunching)) {
    message.isLaunching = isLaunching
  }
  if (!_.isUndefined(isStopping)) {
    message.isStopping = isStopping
  }
  if (!_.isUndefined(isRun)) {
    message.isRun = command.isRun = isRun
  }
  if (!_.isUndefined(log)) {
    command.logs.push(log)
    message.log = log
  }
  sendMessage(MESSAGE_TYPES.LOG, message)
}

module.exports = {
  getCommandById,
  createCommand,
  updateCommand,
}
