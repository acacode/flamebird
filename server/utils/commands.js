const _ = require('lodash')
const uuid = require('short-uuid')
const memCache = require('./mem_cache')
const { MESSAGE_TYPES, sendMessage } = require('../ws')
const { separateEnvsFromString } = require('./envs')

const getCommandById = (configId, taskId) =>
  _.find(memCache.get(`commands-${configId}`, []), { id: taskId }) || {}

/**
 * @typedef {Object} Command
 * @property {string} task
 * @property {Object} envs
 * @property {string} name
 */

const createCommand = (configId, name, commandData, type) => {
  const commonData = separateEnvsFromString(commandData)
  return {
    configId,
    task: commonData.string,
    envs: commonData.envs,
    name: name,
    logs: [],
    isRun: false,
    id: `c${uuid.generate()}`,
    type,
  }
}

const updateCommand = (command, { isRun, isLaunching, isStopping, log }) => {
  const message = {
    name: command.name,
    isRun: command.isRun,
    type: command.type,
    id: command.id,
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
