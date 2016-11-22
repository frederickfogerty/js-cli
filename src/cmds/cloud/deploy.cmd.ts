import {
	R,
	log,
	printTitle,
	run,
	env,
	constants,
	isFuzzyMatch,
	fs,
	fsPath,
	prompt,
} from '../../common';


export const group = 'cloud';
export const name = 'deploy';
export const alias = 'd';
export const description = 'Deploys a module to the cloud.';
export const args = {
	'[module name]': 'The name (or partial name) of one or more modules to deploy',
	'--test, -t': 'Test the deploy settings without starting it.',
};


export async function cmd(
	args: {
		params: string[],
		options: {
			test?: boolean, t?: boolean,
		}
	}
) {
	// Setup initial conditions.
	printTitle('Deploy');
	const isTest = args.options.test || args.options.t || false;


	// Retrieve the list of modules to deploy.
	const modules = await selectedModules(args.params);
	if (modules.length === 0) {
		log.info.yellow('Deployment not started. Mo module was specified.');
		log.info.yellow('Pass the name of one or more modules, or nothing to select from a list.');
		log.info();
		return;
	}

	// Start deploying each module.
	modules.forEach(pkg => deploy(pkg, isTest));
}





function deploy(pkg: constants.IPackageObject, isTest: boolean) {
	// Setup initial conditions.
	const path = pkg.path;
	const isDocker = fs.existsSync(fsPath.join(path, 'Dockerfile'));

	// Build up basic command.
	let cmd = isDocker
		? `now --docker`
		: `now --npm --forward-npm`;

	// Look for environment variables.
	const vars = env.read({ path: fsPath.join(path, '.env') });
	vars.NODE_ENV = 'production';

	// Print details.
	log.info.cyan(pkg.name);
	log.info.blue(` CMD:  ${log.magenta(cmd)}`);
	log.info.blue(` PATH: ${log.magenta(path)}`);

	// Print environment-variables.
	Object.keys(vars).forEach((key, i) => {
		const value = vars[key];

		let output = log.gray(`${key}: ${log.green(value)}`);
		output = i === 0
			? log.blue(` ENV:  ${output}`)
			: `       ${output}`;
		log.info(output);

		// Append the environment-variable to the deploy command.
		cmd += ` -e ${key}=${value}`;
	});

	// Start deployment.
	log.info();
	if (!isTest) {
		let out: string = 'yarn && ';
		const packageJsonPath = fsPath.join(pkg.path, 'package.json');
		if (fs.readJsonSync(packageJsonPath).scripts.prepublish != null) { out += 'npm run prepublish &&'; }
		out += ` ${cmd}`;
		run.execInNewTab(`${out}`, path);
		log.info.gray('Deployment started in new tab.');
	} else {
		log.info.yellow('Running in test mode. Deployment not started.');
	}
}




async function selectedModules(names: string[]): Promise<Array<constants.IPackageObject>> {
	names = R.reject(R.isEmpty, names);
	const promptForModule = async () => {
		const modules = constants
			.SERVICE_MODULE_DIRS
			.toPackageObjects();
		return [(await prompt.forModule(modules))];
	};

	if (names.length === 0) {
		// No module was specified. Prompt the user to select one.
		return await promptForModule();
	} else {

		// Look for modules that match the name (or partial names) provided as CLI arguments.
		let result = matchModules(constants.SERVICE_MODULE_DIRS.toPackageObjects(), names);
		if (result.length === 0) {
			result = await promptForModule(); // No matching name was specified - prompt the user to select one.
		}
		return result;

	}
}


/**
 * Look for modules that match the name (or partial names) provided as CLI arguments.
 */
function matchModules(pkgs: constants.IPackageObject[], names: string[]): constants.IPackageObject[] {
	const isModuleMatch = (name: string) => names.find(pattern => isFuzzyMatch(pattern, name)) !== undefined;
	return constants
		.SERVICE_MODULE_DIRS
		.toPackageObjects()
		.filter(pkg => isModuleMatch(pkg.name));
}
