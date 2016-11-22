import * as os from 'os';
import { R, fs, fsPath } from './util';
import config from './config';


export const ROOT_DIR = config.ROOT_DIR;
export const SCRIPTS_DIR = fsPath.join(config.ROOT_DIR, 'scripts');
export const CODE_DIR = fsPath.join(config.ROOT_DIR, 'code');
export const LIBS_DIR = fsPath.join(CODE_DIR, 'libs');
export const SERVICES_DIR = fsPath.join(CODE_DIR, 'services');
export const DESKTOP_DIR = fsPath.join(CODE_DIR, 'desktop');
export const DESKTOP_LOG_DIR = fsPath.join(os.homedir(), 'Library/Logs/teamdb');


export interface IPackagesArray extends Array<string> {
	toPackagePaths(): Array<string>;
	toPackages(): Array<any>;
	toPackageObjects(): Array<IPackageObject>;
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
	scripts: { [ name: string ]: string };
	dependencies?: { [ name: string ]: string };
	devDependencies?: { [ name: string ]: string };
}



/**
 * Decorates an array of paths with the `IPackagesArray` methods.
 */
function toPackagesArray(paths: Array<string>): IPackagesArray {
	paths = R.clone(paths);
	const result = paths as any;

	// Decorate with methods.
	result.toPackageObjects = (): Array<IPackageObject> => {
		return paths.map(path => {
			const packagePath = fsPath.join(path, 'package.json');
			const pkg = fs.readJsonSync(packagePath) as any;
			return {
				name: pkg.name,
				path,
				package: pkg,
				hasScript: (name: string) => (pkg.scripts && pkg.scripts[ name ]) !== undefined,
			};
		});
	};
	result.toPackagePaths = (): Array<string> => paths.map(path => fsPath.join(path, 'package.json'));
	result.toPackages = (): Array<IPackage> => result.toPackageObjects().map((o: IPackageObject) => o.package);

	// Finish up.
	return result;
}


/**
 * Retrieves the paths of NPM modules within the given directory.
 */
function moduleDirs(parentDir: string): IPackagesArray {
	const dirs = fs
		.readdirSync(parentDir)
		.map((name: string) => fsPath.join(parentDir, name))
		.filter((path: string) => fs.existsSync(fsPath.join(path, 'package.json')));
	return toPackagesArray(dirs);
}


export const DESKTOP_MODULE_DIRS = toPackagesArray([
	fsPath.join(DESKTOP_DIR),
	fsPath.join(DESKTOP_DIR, 'app'),
]);

export const LIB_MODULE_DIRS = moduleDirs(LIBS_DIR);
export const SERVICE_MODULE_DIRS = moduleDirs(SERVICES_DIR);
export const SCRIPTS_MODULE_DIR = toPackagesArray([ SCRIPTS_DIR ]);
export const MODULE_DIRS = toPackagesArray([
	...LIB_MODULE_DIRS,
	...SERVICE_MODULE_DIRS,
	...SCRIPTS_MODULE_DIR,
]);



export function findModule(name: string): IPackageObject | undefined {
	return MODULE_DIRS
		.toPackageObjects()
		.find(pkg => pkg.name === name);
}
