import { log } from './common/util/log';


// NOTE: event name is camelCase as per node convention
process.on('unhandledRejection', function (reason: Error, promise: Promise<any>) {
	log.error(reason);
});

import * as common from './common';
import cli from 'command-interface';
import config from './common/config';

async function init(cb: Function) {
	cli(config.SCRIPTS_DIRS);
	cb();
}

// Passing a callback to stop node exiting early
init(() => null);

