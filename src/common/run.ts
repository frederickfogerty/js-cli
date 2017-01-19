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

const runTask = async (pkg: constants.IPackageObject, commands: string[] | string) => {
	if (commands.length === 0) { return null; }
	if (Array.isArray(commands) && commands.length === 1) {
		commands = commands[0];
	}

	if (Array.isArray(commands)) {
		const tasks = commands.map((command) => ({
			title: command,
			task: () => execaCommand(command, { cwd: pkg.path }),
		}));
		return listr(tasks);
	} else {
		return execaCommand(commands, { cwd: pkg.path });
	}
};


/**
 * Executes the given command on a set of modules.
 */
export function execOn(

	modules: constants.IPackageObject[],
	commands: string | string[],
	options?: IExecOnModulesOptions,

): { listr: Listr } {

	// Setup initial conditions.
	const config = options || { isConcurrent: true };

	// Ensure the modules are in depth-first order.
	modules = deps.orderByDepth(modules);

	// Run the command on each module.
	const tasks = modules.map((pkg) => ({
		title: pkg.name,
		task: () => runTask(pkg, commands),
	}));
	return {
		listr: listr(tasks, { concurrent: config.isConcurrent }),
	};

}


const makeScript = (script: string) =>
	(script.includes('yarn') || script.includes('npm')) // Check if already an npm command
		? script :
		`yarn run ${script}`;

/**
 * Runs the command on a subset of the modules passed which have the command specified in their package.json.
 * E.g. if the script is 'build', modules which don't have a "build" script defined will not be executed.
 */
export function execOnIfScriptExists(

	modules: constants.IPackageObject[],
	scripts: string | string[],
	options: IExecOnModulesOptions = { isConcurrent: true, isTest: false },

) {
	const scriptsArray = Array.isArray(scripts) ? scripts : [scripts];

	const tasks = modules.map((module) => {
		const availableScripts: string[] = scriptsArray.filter((script) => module.hasScript(script));
		const scriptCommands = availableScripts.map(makeScript);
		if (availableScripts.length === 0) { return null; }

		return {
			title: module.name,
			task: () => runTask(module, scriptCommands),
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
