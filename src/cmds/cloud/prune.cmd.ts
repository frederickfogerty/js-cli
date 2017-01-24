import {
	R,
	log,
	printTitle,
	listr,
	time,
	prompt,
	pluralize,
	Listr,
} from '../../common';
import { IDeployment, IAlias, http } from './common';

export const group = 'cloud';
export const name = 'prune';
export const alias = 'p';
export const description = 'Deletes unused instances that deployed in the cloud.';
export const args = {
	'[name]': 'Optional. Name of the deployment (default = all)',
	'--test, -t': 'Test the deploy settings without starting it.',
};



export async function cmdDisable(
	args: {
		params: string[],
		options: {
			test?: boolean, t?: boolean,
		},
	},
) {
	// Setup initial conditions.
	printTitle('Prune Non-Aliased Cloud Deployments ');
	let startedAt = time.timer();
	const names = args.params;
	const isTest = args.options.test || args.options.t || false;

	// Retrieve current deployments and DNS aliases.
	const deployments = await http.getData<IDeployment[]>('deployments');
	const aliases = await http.getData<IAlias[]>('aliases');

	// List domains:
	log.info.blue('Domains:');
	aliases.forEach((item) => {
		const elapsed = `(${time.elapsed(item.created)} ago)`;
		log.info.blue(` - https://${log.magenta(item.alias)} ${log.gray(elapsed)}`);
	});
	log.info();

	// Filters.
	const hasAlias = (id: string) => R.find(R.propEq('deploymentId', id), aliases) !== undefined;
	const nameMatches = (name: string) => {
		if (names.length === 0) { return true; }
		return R.contains(name, names);
	};

	// Build the list of deployments to prune.
	let list = deployments
		.filter((deployment) => nameMatches(deployment.name))
		.filter((deployment) => !hasAlias(deployment.uid));
	list = R.sortBy(R.prop('name'), list);

	// List out what is about to be removed.
	const tasks: Listr.IListrTask[] = [];
	let currentName = '';
	list.forEach((deployment) => {
		const { name, url, uid } = deployment;
		if (currentName !== deployment.name) {
			log.info.cyan(deployment.name);
			currentName = deployment.name;
		}
		log.info.gray(`  ${log.magenta(uid)} https://${url}`);
		tasks.push({
			title: `Delete ${name} - uid:${uid}`,
			task: async() => await http.delete(http.url(`deployments/${uid}`)),
		});
	});


	// Perform the delete.
	log.info();
	if (!isTest) {
		if (tasks.length > 0) {

			const confirmed = await prompt.confirm(`Delete ${tasks.length} ${pluralize('deployment', tasks.length)}?`);
			if (confirmed) {
				startedAt = time.timer(); // Reset timer.
				await listr(tasks).run();
			}

		} else {
			log.info.yellow(`No deployments need to be deleted.`);
		}
	} else {
		log.info.yellow('Running in test mode. No deployments were deleted.');
	}

	// Finish up.
	log.info.gray(`\n${startedAt.elapsed()} elapsed.`);
};



