import { IPackageObject } from './constants';
import { R, fs, fsPath } from './libs';
import { log } from './util';

const CORE_SCRIPTS = ['install', 'i'];
/**
 * Checks whether a package has the script.
 * Handles strings like:
 * 	- build
 * 	- yarn run build
 * 	- npm run build
 * 	- yarn install
 * 	- npm install
 * 	- npm i
 * 	- yarn i
 */
export function hasScript(
	script: string,
	pkg: { scripts?: { [k: string]: string } },
) {
	const scriptStripped = script
		.replace('npm run', '')
		.replace('yarn run', '')
		.replace('npm', '')
		.replace('yarn', '')
		.trim();

	if (CORE_SCRIPTS.includes(scriptStripped)) {
		return true;
	}
	return (pkg.scripts && pkg.scripts[scriptStripped]) != null;
}

export function pathToPackageObject(path: string) {
	const packagePath = fsPath.join(path, 'package.json');
	try {
		const pkg = fs.readJsonSync(packagePath) as any;
		return {
			name: pkg.name,
			path,
			package: pkg,
			hasScript: (name: string) => hasScript(name, pkg),
			refresh: () => pathToPackageObject(path),
		};
	} catch (e) {
		log.info.cyan(`Error when reading package json for path ${path}`);
		throw e;
	}
}

export function refreshPackage(packageObject: IPackageObject) {
	return pathToPackageObject(packageObject.path);
}
