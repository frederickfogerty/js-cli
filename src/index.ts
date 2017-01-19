#!/usr/bin/env node

require('./common/config').init() // tslint:disable-line
	.then(() => {
		require('./init');
	});
