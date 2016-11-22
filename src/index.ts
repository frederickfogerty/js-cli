#!/usr/bin/env node

const config = require('./common/config'); // tslint:disable-line

config.init()
	.then(() => {
		require('./init');
	});
