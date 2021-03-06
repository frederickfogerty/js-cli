import * as path from 'path';
import { log } from './common/util/log';

// NOTE: event name is camelCase as per node convention
process.on('unhandledRejection', function(
	reason: Error,
	promise: Promise<any>,
) {
	log.error.red(reason);
	process.exit(1);
});

import config from './common/config';
import cli from 'command-interface';
import * as minimist from 'minimist';

function checkVersionFlag() {
	const argv = minimist(process.argv.slice(1)) as {
		version?: boolean;
		v?: boolean;
	};
	return argv.version || argv.v;
}

async function init(cb: Function) {
	if (checkVersionFlag()) {
		log.info.blue(require(path.resolve(__dirname, '../package.json')).version);
		return;
	}

	cli(config.SCRIPTS_DIRS);
	cb();
}

// Passing a callback to stop node exiting early
init(() => null);
