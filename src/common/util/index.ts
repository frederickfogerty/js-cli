import * as env from './env';
import http from './http';
export { IResponse, IHttpHeaders } from './http'

export { env, http }
export { log } from './log'
export * from './exec'
export * from './libs'

import * as moment from 'moment';
import * as pluralize from 'pluralize';
import * as constants from '../constants';
import * as Listr from 'listr';
import * as fuzzy from 'fuzzy';

import { log } from './log';
export { moment, pluralize, constants }



export function listr(tasks?: Listr.IListrTask[], options?: Listr.IListrOptions): Listr {
	return new Listr(tasks, options);
}
export { Listr }


/**
 * Strips a path to start at the project root.
 * Helpful for making more readable display output.
 */
export function projectPath(path: string) {
	return path.substr(constants.ROOT_DIR.length, path.length);
}



/**
 * Common styling for a command title.
 */
export function printTitle(title: string, ) {
	log.info.cyan(`
-----------------------------------------------------------------------------------------
 ${title}
-----------------------------------------------------------------------------------------`);
};





/**
 * Determine if a word loosley matches the given pattern.
 */
export function isFuzzyMatch(pattern: string, value: string): boolean {
	return fuzzy.filter(pattern, [value]).length > 0;
}
