#!/usr/bin/env node

require('./common/config').init() // tslint:disable-line
	.then(() => {
		require('./init');
	})
	.catch((err: Error) => {
		const log = require('./common/util/log').log;
		log.error.red(err.message);
	});
