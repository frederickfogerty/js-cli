import { R } from './libs';
import * as inquirer from 'inquirer';
import * as constants from './constants';

const ALL_MODULES_LABEL = 'all modules'

/**
 * Prompts the user to select a module.
 */
export async function forModule(
	pkgs: constants.IPackageObject[],
	message = 'Module',
	opts: { allowAll?: boolean } = { allowAll: true },
): Promise<constants.IPackageObject[]> {
	const choices = (opts.allowAll ? [ALL_MODULES_LABEL] : []).concat(pkgs.map(pkg => pkg.name))

	const confirm = {
		type: 'list',
		name: 'name',
		message,
		choices,
	};
	const { name } = (await inquirer.prompt(confirm));
	return name === ALL_MODULES_LABEL ? pkgs : [R.find(R.propEq('name', name), pkgs)];
}



/**
 * Prompts the user whether they sure they want to continue.
 */
export async function confirm(message: string = 'Are you sure?'): Promise<boolean> {
	const confirm = {
		type: 'confirm',
		name: 'result',
		message,
	};
	const { result } = (await inquirer.prompt(confirm)) as any;
	return result;
}

