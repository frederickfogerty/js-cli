import { IAlias, http } from './common';
import { log, time, printTitle } from '../../common';

export const group = 'cloud';
export const name = 'status';
export const alias = 's';
export const description = 'Creates a status report of the cloud deployment.';

export async function cmd(args: { params: string[]; options: {} }) {
	// Setup initial conditions.
	printTitle('Cloud Status');

	// List domains:
	const aliases = await http.getData<IAlias[]>('aliases');
	log.info.blue('Domains:');
	aliases.forEach(item => {
		const elapsed = `(${time.elapsed(item.created)} ago)`;
		log.info.blue(` - https://${log.magenta(item.alias)} ${log.gray(elapsed)}`);
	});

	// Finish up.
	log.info();
}
