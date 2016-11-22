import { R } from './util';
import * as inquirer from 'inquirer';
import * as constants from './constants';


/**
 * Prompts the user to select a module.
 */
export async function forModule(
  pkgs: constants.IPackageObject[],
  message = 'Module'
): Promise<constants.IPackageObject> {

  const confirm = {
    type: 'list',
    name: 'name',
    message,
    choices: pkgs.map(pkg => pkg.name),
  };
  const { name } = (await inquirer.prompt(confirm));
  return R.find(R.propEq('name', name), pkgs);
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

