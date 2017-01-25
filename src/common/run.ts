import { execaCommand } from './util/execa';
import {
	constants,
	execAsync,
	exec,
	exec$,
	execa,
	listr,
	Listr,
} from './util';
import * as deps from './deps';
export { exec, execAsync, exec$ }
import { R, fsPath } from './libs';


export interface IExecOnModulesResult {
	success: constants.IPackageObject[];
	failed: constants.IPackageObject[];
}
export interface IExecOnModulesOptions {
	isConcurrent?: boolean;
	isTest?: boolean;
}

function createTask(pkg: constants.IPackageObject, commandOrTask: ScriptOrTask): { title: string, task: () => any } {
	if (isTask(commandOrTask)) {
		return commandOrTask as Task;
	}
	const command: string = commandOrTask as string;

	return {
		title: command,
		task: () => execaCommand(command as string, { cwd: pkg.path }),
	};
}

function createTasks(pkg: constants.IPackageObject, commands: ScriptOrTask[]) {
	const tasks = commands.map((command) => createTask(pkg, command));
	return tasks;
};


/**
 * Executes the given command on a set of modules.
 */
export function execOn(

	modules: constants.IPackageObject[],
	commands: string | string[],
	options?: IExecOnModulesOptions,

): { listr: Listr } {
	let commandsArray = Array.isArray(commands) ? commands : [commands];

	// Setup initial conditions.
	const config = options || { isConcurrent: true };

	// Ensure the modules are in depth-first order.
	modules = deps.orderByDepth(modules);

	// Run the command on each module.
	const tasks = modules.map((pkg) => ({
		title: pkg.name,
		task: () => listr(createTasks(pkg, commandsArray)),
	}));
	return {
		listr: listr(tasks, { concurrent: config.isConcurrent }),
	};

}


function makeScript(scriptOrTask: ScriptOrTask): ScriptOrTask {
	if (isTask(scriptOrTask)) { return scriptOrTask; }
	const script: string = scriptOrTask as string;
	return (script.includes('yarn') || script.includes('npm')) // Check if already an npm command
		? script :
		`yarn run ${script}`;
}


type Task = { title: string, task: (() => Promise<any> | Listr) };
type ScriptOrTask = string | Task;
const isTask = (task: ScriptOrTask) => !(typeof task === 'string');

/**
 * Runs the command on a subset of the modules passed which have the command specified in their package.json.
 * E.g. if the script is 'build', modules which don't have a "build" script defined will not be executed.
 */
export function execOnIfScriptExists(

	modules: constants.IPackageObject[],
	scripts: ScriptOrTask | ScriptOrTask[],
	options: IExecOnModulesOptions = { isConcurrent: true, isTest: false },

) {
	const scriptsArray = Array.isArray(scripts) ? scripts : [scripts];

	const tasks = modules.map((module) => {
		const availableScripts: ScriptOrTask[] = scriptsArray
			.filter((script) => isTask(script) ? true : module.hasScript(script as string));
		if (availableScripts.length === 0) { return null; }

		const scriptCommands = availableScripts.map(makeScript);
		const tasks = createTasks(module, scriptCommands);
		if (!tasks) { return null; }

		return {
			title: module.name,
			task: () => listr(tasks),
			tasks: tasks,
		};
	});

	const tasksWithoutNull = R.reject(R.isNil, tasks);

	return {
		listr: listr(tasksWithoutNull, { concurrent: options.isConcurrent }),
		tasks: tasksWithoutNull,
	};

	// const filteredModules = modules.filter((pkg) => pkg.hasScript(scriptsArray));
	// return execOn(
	// 	filteredModules,
	// 	`yarn run ${scripts}`,
	// 	{ isConcurrent: options.isConcurrent, isTest: options.isTest },
	// );
}



/**
 * Opens a new tab in iTerm and executes the given command.
 */
export function execInNewTab(cmd: string, path: string = '') {

	// Ensure path is fully-qualified.
	if (!path.startsWith(constants.ROOT_DIR)) {
		path = fsPath.join(constants.ROOT_DIR, path);
	}

	// Prepare the command to open a new terminal.
	const command = `osascript -e '
    if application "iTerm" is running then
      tell application "iTerm"
          tell current window
              create tab with default profile
              tell current session
                  write text "cd ${path} && clear && ${cmd}"
              end tell
          end tell
      end tell
    else
        activate application "iTerm"
    end if
  '`;

	// Execute the command.
	exec(command, { silent: true });
}
