import { toPackagesArray } from './constants';
import { pathToPackageObject } from './package';
import * as constants from './constants';

export function getModulesFromParams(
	params: string[] = [],
	modules: string[] = constants.MODULE_DIRS,
): constants.IPackagesArray {
	const isKeywordMatch = (pkg: constants.IPackageObject) => {
		if (params.length === 0) {
			return true;
		}
		return params.find(pattern => pkg.name.indexOf(pattern) !== -1);
	};

	const filteredModules = modules.filter(module =>
		isKeywordMatch(pathToPackageObject(module)),
	);

	return toPackagesArray(filteredModules);
}
