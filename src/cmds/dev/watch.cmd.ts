import { run } from '../../common';
import * as syncWatch from './sync-watch.cmd';


export const group = 'dev';
export const name = 'watch';
export const alias = 'w';
export const description = 'Starts `build:watch` and `sync:watch` in tabs.';


export function cmd() {
	syncWatch.cmd();
	run.execInNewTab(`j build:watch`);
}

