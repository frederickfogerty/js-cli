import {
	constants,
	execAsync,
	exec,
	exec$,
	execa,
	fsPath,
	listr,
	Listr
} from './util';
import * as deps from './deps';
export { exec, execAsync, exec$ }


export interface IExecOnModulesResult {
	success: Array<constants.IPackageObject>;
	failed: Array<constants.IPackageObject>;
}
export interface IExecOnModulesOptions {
	isConcurrent?: boolean;
	isTest?: boolean;
}


/**
 * Executes the given command on a set of modules.
 */
export function execOn(

	modules: Array<constants.IPackageObject>,
	command: string,
	options?: IExecOnModulesOptions,

): { listr: Listr, results: IExecOnModulesResult } {

	// Setup initial conditions.
	const config = options || { isConcurrent: true };
	const results = {
		success: [] as Array<constants.IPackageObject>,
		failed: [] as Array<constants.IPackageObject>,
	};

	// Ensure the modules are in depth-first order.
	modules = deps.orderByDepth(modules);

	const runTask = async (pkg: constants.IPackageObject) => {
		const commands = command.split(' ');
		const file = commands[0];
		const args = commands.slice(1);
		const cmd = `${pkg.path} && ${command}`;
		// const err = new Error(`Failed while running '${command}' on '${pkg.name}'.`);
		if (!config.isTest) {
			// console.log(file, args);

			return execa(file, args, { cwd: pkg.path });
			// execResult = await execAsync(cmd, { silent: true });
		}
		return 'TEST';
		// try {
		// 	// let execResult = { code: 0 };
		// 	// if (execResult.code === 0) {
		// 	// 	results.success.push(pkg);
		// 	// } else {
		// 	// 	results.failed.push(pkg);
		// 	// 	throw err;
		// 	// }
		// } catch (error) {
		// 	results.failed.push(pkg);
		// 	// throw err;
		// }
	};

	// Run the command on each module.
	const tasks = modules.map(pkg => ({
		title: pkg.name,
		task: () => runTask(pkg),
	}));
	return {
		listr: listr(tasks, { concurrent: config.isConcurrent }),
		results
	};

}


/**
 * Runs the command on a subset of the modules passed which have the command specified in their package.json.
 * E.g. if the script is 'build', modules which don't have a "build" script defined will not be executed.
 */
export function execOnIfScriptExists(

	modules: Array<constants.IPackageObject>,
	script: string,
	options: IExecOnModulesOptions = { isConcurrent: true, isTest: false },

) {
	const filteredModules = modules.filter(pkg => pkg.hasScript(script));
	console.log('modules', modules);
	console.log('filteredModules', filteredModules);
	console.log('script', script);
	return execOn(
		filteredModules,
		`yarn run ${script}`,
		{ isConcurrent: options.isConcurrent, isTest: options.isTest }
	);
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
