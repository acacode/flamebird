const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const storage = require('./storage')
const ws = require('../ws')
const { separateEnvsFromString } = require('./envs')

const getCommandById = id => _.find(storage.get('commands', []), { id }) || {}

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
    id: uuidv1(),
    type,
  }
}

const updateCommand = (taskId, { isRun, isLaunching, isStopping, log }) => {
  const command = getCommandById(taskId)
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
  ws.send(message)
}

module.exports = {
  getCommandById,
  createCommand,
  updateCommand,
}
