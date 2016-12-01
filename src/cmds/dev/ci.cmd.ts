import { IS_MAIN_BRANCH, LIB_MODULE_DIRS, MODULE_DIRS, SERVICE_MODULE_DIRS } from '../../common/constants';
import { R, run, config, constants, log, printTitle, time, listr } from '../../common';
import { createPackageSyncListr } from './sync-libs.cmd';
import { deployPackages } from '../cloud/deploy.cmd';

export const name = 'ci';
export const group = 'dev';
export const alias = 'ci';
export const description = 'Executes the equivalent steps to CI on this computer';
export const args = {
	// '[script]': 'The name of the NPM script to run',
	// '--test, -t': 'Flag indicating if a test run should be performed (default: false).',
	'--yolo, -y': `Don't clean and install fresh deps`,
	'--fast': `Install dependencies concurrently (doesn't work on CI)`,
};

export async function cmd(args: {
	params: string[],
	options: {
		fast?: boolean,
		yolo?: boolean
	}
}) {
	// Setup initial conditions.
	const startedAt = time.timer();

	const currentModules = (IS_MAIN_BRANCH ? SERVICE_MODULE_DIRS : MODULE_DIRS).toPackageObjects();

	// Remove all node_modules
	const removeTask = () => run.execOn(currentModules, `rm -rf node_modules`).listr;

	// Install in all modules
	const installTask = () => run.execOn(currentModules, `yarn`, { isConcurrent: args.options.fast }).listr;

	// Run a build and sync
	const buildLibsTask = () => run.execOnIfScriptExists(LIB_MODULE_DIRS.toPackageObjects(), `build`).listr;
	const syncTask = () => createPackageSyncListr().syncListr;

	const buildTask = () => run.execOnIfScriptExists(currentModules, `build`).listr;
	const lintTask = () => run.execOnIfScriptExists(currentModules, `lint`).listr;
	const testTask = () => run.execOnIfScriptExists(currentModules, `test`).listr;


	const preTaks = !args.options.yolo
		? [
			{ title: 'Clean', task: removeTask },
			{ title: 'Install', task: installTask },
		]
		: []


	const buildTasks = IS_MAIN_BRANCH
		? [{ title: 'Build Services', task: buildTask }]
		: [
			{ title: 'Build Libs', task: buildLibsTask },
			{ title: 'Sync', task: syncTask },
			{ title: 'Build', task: buildTask }
		]

	// Only deploy automatically on CI
	const shouldDeploy = process.env.CI // && IS_MAIN_BRANCH
	const deployTasks = shouldDeploy
		? [{ title: 'Deploy', task: () => deployPackages(SERVICE_MODULE_DIRS.toPackageObjects()) }]
		: []

	const tasks = [
		...preTaks,
		...buildTasks,
		{ title: 'Lint', task: lintTask },
		{ title: 'Test', task: testTask },
		// ...deployTasks,
	];

	await listr(tasks).run();
}
