import { startsWithOrgName } from '../../common/packages';
import { getModulesFromParams } from '../../common/params';
import { refreshPackage } from '../../common/package';
import { EventTargetLike } from 'rxjs/observable/FromEventObservable';
import { listr } from '../../common/util';
import {
	R,
	printTitle,
	log,
	constants,
	deps,
	fs,
	fsPath,
	time,
	isFuzzyMatch,
	moment,
	config,
} from '../../common';
import * as Rsync from 'rsync';

export const group = 'dev';
export const name = 'sync:libs';
export const alias = 'sl';
export const description = 'Copies local libs to dependent modules.';
export const args = {
	'[module names]': 'Optional names of libs to include. Default: all',
};

/**
 * Sync libs
 * args.params = modules to sync FROM.
 */
export async function cmd(args: { params: string[]; options: {} }) {
	const startedAt = time.timer();
	const { length, listr } = createPackageSyncListr(args);
	await listr.run();
	const elapsed = startedAt.elapsed();
}

export function createPackageSyncListr(args?: {
	params: string[];
	options: {};
}) {
	// Setup initial conditions.
	const params = (args && args.params) || [];
	const syncSources = getModulesFromParams(params);

	const canCopy = (pkg: constants.IPackageObject) => {
		// Don't copy simply configuration modules (like 'babel' or 'typescript')
		// that do not have lib output.
		const hasFolder = (folder: string) =>
			fs.existsSync(fsPath.join(pkg.path, folder));
		return true;
		// return hasFolder('src') || hasFolder('pages');
	};

	const findDependenciesOfModule = (
		pkg: constants.IPackage,
	): constants.IPackageObject[] => {
		const dependencies = Object.keys(deps.mergeDependencies(pkg)).filter(
			startsWithOrgName,
		);
		return syncSources
			.toPackageObjects()
			.filter(item => item.name !== pkg.name)
			.filter(item => R.contains(item.name, dependencies))
			.filter(item => canCopy(item));
	};

	const syncTargets = deps
		.orderByDepth(constants.MODULE_DIRS.toPackageObjects())
		.map(item => ({
			name: item.name,
			path: item.path,
			localDependencies: findDependenciesOfModule(item.package),
			package: item,
		}))
		.filter(item => item.localDependencies.length > 0);

	// Copy local dependencies into each module.
	const tasks = syncTargets.map(target => {
		const targetName = log.magenta(target.name);
		const sourceNames = target.localDependencies
			.map(source => log.blue(source.name))
			.join(log.blue(', '));
		const timeStamp = log.gray(moment().format('h:mm:ss a'));
		const title = `Update ${targetName} with ${sourceNames} - ${timeStamp}`;

		const task = async () => {
			await Promise.all(
				target.localDependencies.map(async source => {
					await copyModule(source, target);
					syncPackageVersion(source, target.package);
				}),
			);
		};

		return {
			title,
			task,
		};
	});

	// Finish up.
	return {
		length: syncTargets.length,
		listr: listr(tasks),
	};
}

interface IRsyncResult {
	err: Error;
	code: number;
	cmd: string;
}

function rsyncExecute(rsync: any): Promise<IRsyncResult> {
	return new Promise<IRsyncResult>((resolve, reject) => {
		rsync.execute((err: Error, code: number, cmd: string) => {
			if (err) {
				reject(err);
			} else {
				resolve({ err, code, cmd });
			}
		});
	});
}

async function copyModule(
	from: { name: string; path: string },
	to: { name: string; path: string },
) {
	const IGNORE = [
		'node_modules',
		'typings',
		'src',
		'.DS_Store',
		'.babelrc',
		'.tmp',
		'.npmignore',
		// 'tsconfig.json',
		// 'tslint.json',
		'typings.json',
	];
	const FROM_DIR = fsPath.join(from.path, '/');
	const TO_DIR = fsPath.join(to.path, 'node_modules', from.name, '/');
	fs.ensureDirSync(TO_DIR);

	const rsync = new Rsync()
		.source(FROM_DIR)
		.destination(TO_DIR)
		.exclude(IGNORE)
		.delete()
		.flags('aW');
	await rsyncExecute(rsync);
}

function containsPackage(name: string, target: constants.IPackageObject) {
	const dependenciesSafe = target.package.dependencies || {};
	const devDependenciesSafe = target.package.devDependencies || {};
	return name in dependenciesSafe || name in devDependenciesSafe;
}

export function getNewPackageObject(
	source: constants.IPackageObject,
	target: constants.IPackageObject,
) {
	if (!containsPackage(source.name, target)) {
		return target.package;
	}
	const dependencies = target.package.dependencies || {};
	const devDepenencies = target.package.devDependencies || {};

	// Setup initial conditions.
	const sourceVersion = source.package.version;
	const dependencyLocation: 'dependencies' | 'devDependencies' =
		source.name in dependencies ? 'dependencies' : 'devDependencies';

	const dependencyObjectContainingSource =
		target.package[dependencyLocation] || {};

	const targetVersion = dependencyObjectContainingSource[source.name];
	if (targetVersion === sourceVersion) {
		return target.package;
	}

	// Update the version on the target package.
	const targetPackage = R.clone(target.package);
	(targetPackage[dependencyLocation] || {})[source.name] = sourceVersion;

	return targetPackage;
}

/**
 * Updates the dependency version of the target with the given source package.
 */
function syncPackageVersion(
	source: constants.IPackageObject,
	target: constants.IPackageObject,
): boolean {
	// Make sure that the package objects are up-to-date.
	source = refreshPackage(source);
	target = refreshPackage(target);

	const newPackageObject = getNewPackageObject(source, target);

	// Save the package.json file.
	const path = fsPath.join(target.path, 'package.json');
	fs.outputJsonSync(path, newPackageObject);

	// Finish up.
	return true;
}
