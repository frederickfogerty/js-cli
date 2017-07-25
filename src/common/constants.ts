import * as os from 'os';
import { R, fs, fsPath } from './libs';
import config from './config';
import { pathToPackageObject } from './package';

export const ROOT_DIR = config.ROOT_DIR;
export const SCRIPTS_DIR = fsPath.join(config.ROOT_DIR, 'scripts');
// export const CODE_DIR = fsPath.join(config.ROOT_DIR, config.);
export const LIBS_DIR = fsPath.join(ROOT_DIR, config.LIBS_DIR);
export const SERVICES_DIR = fsPath.join(ROOT_DIR, config.APPS_DIR);
// export const DESKTOP_DIR = fsPath.join(CODE_DIR, 'desktop');
export const DESKTOP_LOG_DIR = fsPath.join(os.homedir(), 'Library/Logs/teamdb');

export interface IPackagesArray extends Array<string> {
	toPackagePaths(): string[];
	toPackages(): any[];
	toPackageObjects(): IPackageObject[];
}

export interface IPackageObject {
	path: string;
	name: string;
	package: IPackage;
	hasScript(name: string): boolean;
}

export interface IPackage {
	name: string;
	version: string;
	scripts: { [name: string]: string };
	dependencies?: { [name: string]: string };
	devDependencies?: { [name: string]: string };
}

/**
 * Decorates an array of paths with the `IPackagesArray` methods.
 */
export function toPackagesArray(paths: string[]): IPackagesArray {
	paths = R.clone(paths);
	const result = paths as any;

	// Decorate with methods.
	result.toPackageObjects = (): IPackageObject[] => {
		return paths.map(pathToPackageObject);
	};
	result.toPackagePaths = (): string[] =>
		paths.map(path => fsPath.join(path, 'package.json'));
	result.toPackages = (): IPackage[] =>
		result.toPackageObjects().map((o: IPackageObject) => o.package);

	// Finish up.
	return result;
}

/**
 * Retrieves the paths of NPM modules within the given directory.
 */
function moduleDirs(parentDir: string): IPackagesArray {
	if (parentDir == null || parentDir.length === 0) {
		return toPackagesArray([]);
	}
	const dirs = fs
		.readdirSync(parentDir)
		.map((name: string) => fsPath.join(parentDir, name))
		.filter((path: string) => fs.existsSync(fsPath.join(path, 'package.json')));
	return toPackagesArray(dirs);
}

export const LIB_MODULE_DIRS = moduleDirs(LIBS_DIR);
export const SERVICE_MODULE_DIRS = moduleDirs(SERVICES_DIR);
export const SCRIPTS_MODULE_DIR = toPackagesArray([SCRIPTS_DIR]);
export const MODULE_DIRS = toPackagesArray([
	...LIB_MODULE_DIRS,
	...SERVICE_MODULE_DIRS,
	...SCRIPTS_MODULE_DIR,
]);

export function findModule(name: string): IPackageObject | undefined {
	return MODULE_DIRS.toPackageObjects().find(pkg => pkg.name === name);
}

export const IS_CI = process.env.CI;

export const CURRENT_BRANCH = process.env.CURRENT_BRANCH;
export const IS_MAIN_BRANCH = config.MAIN_BRANCHES.includes(CURRENT_BRANCH);

export const IS_TTY = (process.stdout as any).isTTY && !IS_CI;

// export const AUTH0_REFRESH_TOKEN=
