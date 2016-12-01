import * as dotenv from 'dotenv';
import { fs, fsPath } from '../libs';
import config from '../config';


export interface IReadOptions {
	path?: string;
}

const parentModuleDir = () => {
	const parts = __dirname.split('/');
	return parts
		.reverse()
		.splice(parts.indexOf('node_modules') + 1, parts.length)
		.reverse()
		.join('/');
};


const toPath = (options: IReadOptions = {}) => {
	return options.path || fsPath.join(parentModuleDir(), './.env');
};


/**
 * Determines whether an .env exists.
 */
export function exists(options: IReadOptions = {}) {
	return fs.existsSync(toPath(options));
}


/**
 * Reads in the configuration values if the `.env` file exists.
 */
export function read(options: IReadOptions = {}): any {
	return exists(options)
		? dotenv.config({ path: toPath(options) })
		: {};
}


// Load environment by default.
read();
