import { getModulesFromParams } from '../../common/params';
import { R, run, constants, config, log, printTitle, time } from '../../common';

export const name = 'install';
export const group = 'dev';
export const alias = 'i';
export const description = 'Run yarn:install on all modules';
export const args = {};

export async function cmd(args: { params: string[] }) {
	printTitle('Installing dependencies');

	const cmd = config.USE_YARN ? 'yarn' : 'npm i';

	const modules = getModulesFromParams(args.params)
		.toPackageObjects();

	await run.execOn(modules, cmd, { isConcurrent: true, exitOnError: false }).listr.run();
}
