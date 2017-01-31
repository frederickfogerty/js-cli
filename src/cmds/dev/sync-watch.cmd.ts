import {
	constants,
	fs,
	fsPath,
	log,
	printTitle,
	deps,
} from '../../common';
import * as chokidar from 'chokidar';
import * as syncLibs from './sync-libs.cmd';
// Typescript definitions are wrong for debounce, so we need to use require
const debounce = require('debounce'); // tslint:disable-line


export const group = 'dev';
export const name = 'sync:watch';
export const alias = 'sw';
export const description = 'Auto syncs when module files change.';


const PATTERN = '/lib/**/*.{js,ts}';

export async function cmd(
	args?: {
		params: string[],
		options: {},
	},
) {

	printTitle('Sync on change');

	const modules = constants
		.MODULE_DIRS
		.toPackageObjects()
		.filter((pkg) => fs.existsSync(fsPath.join(pkg.path, 'tsconfig.json')));

	modules.forEach((pkg) => {
		log.info.blue(` - ${log.magenta(pkg.name)}${log.gray(PATTERN)}`);
		watch(pkg);
	});
	log.info();
}



function watch(pkg: constants.IPackageObject) {
	const sync = () => {
		const pkgs = deps.dependsOn(pkg);
		if (pkgs.length > 0) {
			syncLibs.cmd({
				params: pkgs.map((pkg) => pkg.name),
				options: {},
			});
		}
	};

	const syncDebounced = debounce(sync, 500);

	chokidar
		.watch(`${pkg.path}${PATTERN}`)
		.on('change', (path) => syncDebounced());
}
