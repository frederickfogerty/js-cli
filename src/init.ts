import * as path from 'path';
import * as fs from 'fs';
import { loadavg } from 'os';
import { log } from './common/util/log';


// NOTE: event name is camelCase as per node convention
process.on('unhandledRejection', function (reason: Error, promise: Promise<any>) {
	log.error(reason);
});

import * as common from './common';
import cli from 'command-interface';
import config from './common/config';
import * as minimist from 'minimist';

function checkVersionFlag() {
	const argv: { version?: boolean, v?: boolean } = minimist(process.argv.slice(1));
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

