import { field, model } from "serializy"

const Command = {
  envs: field("envs", "object"),
  id: field("id", "string"),
  isRun: field("isRun", "boolean"),
  name: field("name", "string"),
  rawTask: field("rawTask", "string"),
  task: field("task", "string"),
  type: field("type", "string")
}

export default model(Command)
