import {
	IS_CI,
	IS_MAIN_BRANCH,
	LIB_MODULE_DIRS,
	LIBS_DIR,
	MODULE_DIRS,
	SERVICE_MODULE_DIRS,
} from '../../common/constants';
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
		yolo?: boolean,
	},
}) {
	// Setup initial conditions.
	const startedAt = time.timer();

	const currentModules = (IS_MAIN_BRANCH ? SERVICE_MODULE_DIRS : MODULE_DIRS).toPackageObjects();
	const libModules = LIB_MODULE_DIRS.toPackageObjects();
	const codeModules = SERVICE_MODULE_DIRS.toPackageObjects();

	// Remove all node_modules
	const removeTask = () => run.execOn(currentModules, config.ci.cleanCmd).listr;

	// Install in all modules
	const installTask = () => run.execOn(currentModules, config.ci.installCmd, { isConcurrent: args.options.fast }).listr;
	const installLibsTask = () => run.execOn(libModules, config.ci.installCmd, { isConcurrent: args.options.fast }).listr;
	const installCodeTask = () => run.execOn(codeModules, config.ci.installCmd, { isConcurrent: args.options.fast }).listr;

	// Run a build and sync
	const buildLibsTask = () => run.execOnIfScriptExists(libModules, `build`).listr;
	const syncTask = () => createPackageSyncListr().syncListr;

	const buildServicesTask = () => run.execOnIfScriptExists(SERVICE_MODULE_DIRS.toPackageObjects(), `build`).listr;
	const buildTask = () => run.execOnIfScriptExists(currentModules, `build`).listr;
	const lintTask = () => run.execOnIfScriptExists(currentModules, `lint`).listr;
	const testTask = () => run.execOnIfScriptExists(currentModules, `test`).listr;


	const YOLO = args.options.yolo;
	const preTaks = !YOLO
		? [{ title: 'Clean', task: removeTask }]
		: [];


	const installAndBuildTasks = IS_MAIN_BRANCH
		? [
			...(!YOLO ? [{ title: 'Install', task: installTask }] : []),
			{ title: 'Build', task: buildTask },
		]
		: [
			...(!YOLO ? [{ title: 'Install Libs', task: installLibsTask }] : []),
			{ title: 'Build Libs', task: buildLibsTask },
			...(!YOLO ? [{ title: 'Install Services', task: installCodeTask }] : []),
			{ title: 'Sync', task: syncTask }, // Sync after install to make sure latest code is used for libs.
			{ title: 'Build Services', task: buildServicesTask },
		];

	// Only deploy automatically on CI
	const shouldDeploy = config.AUTO_DEPLOY && process.env.CI && IS_MAIN_BRANCH;
	const deployTasks = shouldDeploy
		? [{ title: 'Deploy', task: () => deployPackages(SERVICE_MODULE_DIRS.toPackageObjects()) }]
		: [];

	const tasks = [
		...preTaks,
		...installAndBuildTasks,
		{ title: 'Lint', task: lintTask },
		{ title: 'Test', task: testTask },
		...deployTasks,
	];

	await listr(tasks).run();
}
