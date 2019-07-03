import { field, fieldArray, model } from "serializy"
import reduce from "lodash-es/reduce"
import Command from "./Command"

const AppInfo = {
  tasksMap: fieldArray(
    ({ commands }) =>
      reduce(
        commands,
        (map, command) => {
          if (!map[command.type]) {
            map[command.type] = []
          }
          map[command.type].push(new Command(command))
          return map
        },
        {}
      ),
    ({ tasksMap }) => ({
      commands: reduce(
        tasksMap,
        (commands, tasks) => [
          ...commands,
          ...tasks.map(task => task.deserialize())
        ],
        []
      )
    })
  ),
  ignorePms: field("ignorePms", "boolean"),
  projectName: field("name", "string"),
  port: field("port", "integer"),
  sortByName: field("sortByName", "boolean"),
  tasks: fieldArray("tasks", "string"),
  useAnotherPm: field("useAnotherPm", "string"),
  useOnlyPackageJson: field("useOnlyPackageJson", "boolean"),
  web: field("web", "boolean"),
  withoutBrowser: field("withoutBrowser", "boolean")
}

export default model(AppInfo)
