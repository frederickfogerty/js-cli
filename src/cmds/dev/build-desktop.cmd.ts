import { log, run, constants } from '../../common';
// import * as clearIconCache from './clear-icon-cache.cmd';

export const group = 'dev';
export const name = 'build:desktop';
export const alias = 'ba';
export const description = 'Builds and packages the desktop Electron app.';


export function cmdDisable() {
	// clearIconCache.cmd();
	// run.execInNewTab(`cd ${constants.DESKTOP_DIR} && npm run dist`);
	run
		.exec$(`cd ${constants.DESKTOP_DIR} && npm run dist`)
		.forEach((e) => log.info(e.stdout));
}
