import { execaCommand } from '../../common/util';
import { startsWithOrgName } from '../../common/packages';
import { getModulesFromParams } from '../../common/params';
import {
	fs,
	fsPath,
	run,
	constants,
	log,
	printTitle,
	config,
} from '../../common';
import * as chokidar from 'chokidar';
import * as babelCore from 'babel-core';
import * as rightPad from 'pad-right';


export const group = 'dev';
export const name = 'build:watch';
export const alias = 'bw';
export const description = 'Starts TypeScript/Babel build-watchers for all modules.';

const TS_MODULES = constants
	.MODULE_DIRS
	.toPackageObjects()
	.filter((pkg) => startsWithOrgName(pkg.name))
	.filter((pkg) => fs.existsSync(fsPath.join(pkg.path, 'tsconfig.json')));

const hasBuildWatch = (pkg: constants.IPackageObject) => pkg.hasScript(config.packageScripts.BUILD_WATCH_COMMAND);

export function cmd(args: { params: string[] }) {
	printTitle('TypeScript Build Watchers');

	const modules = getModulesFromParams(args.params, TS_MODULES.map((pkg) => pkg.path))
		.toPackageObjects()
		.filter((pkg) => startsWithOrgName(pkg.name))
		.filter((pkg) => fs.existsSync(fsPath.join(pkg.path, 'tsconfig.json')));

	const modulesWithBuildWatch = modules.filter(hasBuildWatch);
	const modulesWithoutBuildWatch = modules
		.filter((pkg) => !hasBuildWatch(pkg));

	if (modulesWithBuildWatch.length === 0) {
		log.info.yellow('⚠️  No matching modules found.\n');
		return;
	}

	// Print list.
	modulesWithBuildWatch.forEach((pkg) => {
		log.info.blue(` - ${log.magenta(pkg.name)}`);
	});
	log.info();


	if (modulesWithoutBuildWatch.length > 0) {
		log.info.gray(`Not watching: (no ${config.packageScripts.BUILD_WATCH_COMMAND} script found)`);
		modulesWithoutBuildWatch.forEach((pkg) => {
			log.info.gray(` - ${pkg.name}`);
		});
		log.info();
	}

	const prefixLength = modules.map((pkg) => pkg.name.length).reduce((p, v) => Math.max(p, v), 0);

	// Start the watchers.
	modules.forEach((module) => watchTypescript(module, { prefixLength }));
}



function watchTypescript(
	pkg: constants.IPackageObject,
	{ prefixLength = 10 }: { prefixLength?: number } = {},
) {
	if (!pkg.hasScript(config.packageScripts.BUILD_WATCH_COMMAND)) { return; }

	const cmd = `cd ${pkg.path} && yarn run ${config.packageScripts.BUILD_WATCH_COMMAND}`;
	execaCommand(cmd)
		.forEach((e: string) => {
			const stdout = (e || '').replace(/\n$/, '');
			const nameWithPadding = rightPad(pkg.name, prefixLength, ' ');
			const prefix = stdout.includes('error')
				? log.red(`${log.yellow(nameWithPadding)}`)
				: log.blue(nameWithPadding);
			log.info(`${prefix} ${stdout}`);
		});
}

