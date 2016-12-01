import { LIB_MODULE_DIRS, MODULE_DIRS } from '../../common/constants';
import { R, run, constants, log, printTitle, time, listr } from '../../common';
import { createPackageSyncListr } from './sync-libs.cmd';

export const name = 'ci';
export const group = 'dev';
export const alias = 'ci';
export const description = 'Executes the equivalent steps to CI on this computer';
export const args = {
	// '[script]': 'The name of the NPM script to run',
	// '--test, -t': 'Flag indicating if a test run should be performed (default: false).',
	'--yolo, -y': `Don't clean and install fresh deps`,
};

export async function cmd(args: {
	params: string[],
	options: {
		yolo?: boolean
	}
}) {
	// Setup initial conditions.
	const startedAt = time.timer();


	const modules = MODULE_DIRS.toPackageObjects();

	// Remove all node_modules
	const removeTask = () => run.execOn(modules, `rm -rf node_modules`).listr;

	// Install in all modules
	const installTask = () => run.execOn(modules, `yarn`, { isConcurrent: false }).listr;

	// Run a build and sync
	const buildTask = () => run.execOnIfScriptExists(LIB_MODULE_DIRS.toPackageObjects(), `build`).listr;
	const syncTask = () => createPackageSyncListr().syncListr;

	const lintTask = () => run.execOnIfScriptExists(modules, `lint`).listr;
	const testTask = () => run.execOnIfScriptExists(modules, `test`).listr;

	const tasks = [
		...(
			!args.options.yolo
				? [
					{ title: 'Clean', task: removeTask },
					{ title: 'Install', task: installTask },
				]
				: []
		),
		{ title: 'Build', task: buildTask },
		{ title: 'Sync', task: syncTask },
		{ title: 'Lint', task: lintTask },
		{ title: 'Test', task: testTask }
	];

	await listr(tasks).run();
}
