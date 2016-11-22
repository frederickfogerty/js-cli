import {
	constants,
	execAsync,
	exec,
	exec$,
	fsPath,
	listr,
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
export async function execOn(

	modules: Array<constants.IPackageObject>,
	command: string,
	options?: IExecOnModulesOptions,

): Promise<IExecOnModulesResult> {

	// Setup initial conditions.
	const config = options || {};
	const results = {
		success: [] as Array<constants.IPackageObject>,
		failed: [] as Array<constants.IPackageObject>,
	};

	// Ensure the modules are in depth-first order.
	modules = deps.orderByDepth(modules);

	const runTask = async (pkg: constants.IPackageObject) => {
		const cmd = `cd ${pkg.path} && ${command}`;
		const err = new Error(`Failed while running '${command}' on '${pkg.name}'.`);
		try {
			let execResult = { code: 0 };
			if (!config.isTest) {
				execResult = await execAsync(cmd, { silent: true });
			}
			if (execResult.code === 0) {
				results.success.push(pkg);
			} else {
				results.failed.push(pkg);
				throw err;
			}
		} catch (error) {
			results.failed.push(pkg);
			throw err;
		}
	};

	// Run the command on each module.
	const tasks = modules.map(pkg => ({
		title: pkg.name,
		task: () => runTask(pkg),
	}));
	const taskList = listr(tasks, { concurrent: config.isConcurrent });
	try {
		await taskList.run();
	} catch (error) {
		// Ignore - the calling code will handle the error.
	}

	// Finish up.
	return results;
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
