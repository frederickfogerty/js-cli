import { config, run } from '../../common';
import * as syncWatch from './sync-watch.cmd';

export const group = 'dev';
export const name = 'watch';
export const alias = 'w';
export const description = 'Starts `build:watch` and `sync:watch` in tabs.';

export function cmd() {
	run.execInNewTab(`${config.SCRIPT_PREFIX} sync:watch`);
	run.execInNewTab(`${config.SCRIPT_PREFIX} build:watch`);
}
