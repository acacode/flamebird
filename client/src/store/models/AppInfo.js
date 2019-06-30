import { field, fieldArray, model } from 'serializy'
import Command from './Command'

const AppInfo = {
	commands: fieldArray('commands', Command),
	ignorePms: field('ignorePms', 'boolean'),
	name: field('name', 'string'),
	port: field('port', 'integer'),
	sortByName: field('sortByName', 'boolean'),
	tasks: fieldArray('tasks', 'string'),
	useAnotherPm:field('useAnotherPm', 'string'),
	useOnlyPackageJson: field('useOnlyPackageJson', 'boolean'),
	web: field('web', 'boolean'),
	withoutBrowser: field('withoutBrowser', 'boolean'),
}


export default model(AppInfo)