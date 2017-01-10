import { R, constants, config } from '../common';
import * as toposort from 'toposort';


export function mergeDependencies(pkg: constants.IPackage): { [name: string]: string } {
	return R.merge(pkg.dependencies || {}, pkg.devDependencies || {});
}



function toDependenciesArray(pkg: constants.IPackage) {
	const deps = mergeDependencies(pkg);
	const result = Object
		.keys(deps)
		.map((name) => name)
		.filter((name) => name.startsWith(config.ORG_NAME))
		.map((name) => [pkg.name, name]);
	return result.length === 0
		? [[pkg.name]]
		: result;
}


/**
 * Retrieves a depth-first dependency order from the given packages.
 */
export function orderByDepth(packages: constants.IPackageObject[]): constants.IPackageObject[] {
	const graph = packages
		.filter((item) => item.name.startsWith(config.ORG_NAME))
		.map((item) => toDependenciesArray(item.package))
		.reduce((acc: any[], items: any[]) => {
			items.forEach((item) => acc.push(item));
			return acc;
		}, []);
	const names = toposort<string>(graph).reverse();
	const result = names.map((name) => R.find(R.propEq('name', name), packages));
	return R.reject(R.isNil, result);
}



/**
 * Retrieves an array of packages that depend on the given package.
 */
export function dependsOn(pkg: constants.IPackageObject): constants.IPackageObject[] {
	const isDependent = (item: constants.IPackage) => {
		const deps = R.merge(item.dependencies || {}, item.devDependencies || {});
		return deps[pkg.name] !== undefined;
	};
	return constants
		.MODULE_DIRS
		.toPackageObjects()
		.filter((item) => item.name !== pkg.name)
		.filter((item) => isDependent(item.package));
}
