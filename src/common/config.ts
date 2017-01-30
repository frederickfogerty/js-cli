import { SCRIPTS_DIR } from './constants';
import { projectPath } from './util';
import * as path from 'path';
import * as fse from 'fs-extra-promise';
import * as fsPath from 'path';
import * as fs from 'fs-extra-promise';
import * as invariant from 'invariant';
import * as dotenv from 'dotenv';
import * as R from 'ramda';
import * as u from 'updeep';

const CONFIG_FILE = 'js-cli-config.js';

async function checkDirIsRoot(path: string) {
	const files = await fse.readdirAsync(path);
	let found = false;
	files.forEach((file) => {
		if (file === CONFIG_FILE) { found = true; }
	});

	return found;

}

async function findRootDir() {
	let dirPath = process.cwd();
	while (dirPath !== '/') {
		const isRoot = await checkDirIsRoot(dirPath);
		if (isRoot) { return dirPath; }

		dirPath = path.join(dirPath, '../');
	}

	throw new Error(`Root directory not found. Have you created a \'${CONFIG_FILE}\' file in the root of your project?`);
}

const DEFAULT_SCRIPT_DIRS = path.join(__dirname, '../cmds/**');

const config = {
	ROOT_DIR: '',
	SCRIPTS_DIRS: [] as string[],
	ORG_NAME: '',
	USE_YARN: true,
	ENV_FILES: [],
	NOW_TOKEN: '',
	MAIN_BRANCHES: ['master', 'dev'],
	AUTO_DEPLOY: true,
	ci: {
		cleanCmd: 'rm -rf node_modules',
		installCmd: 'yarn',
	},
	packageScripts: {
		BUILD_WATCH_COMMAND: 'build:watch',
	},

	AUTH0_REFRESH_TOKEN: '',
	AUTH0_CLIENT_ID: '',
	AUTH0_DOMAIN: '',

	LIBS_DIR: '',
	APPS_DIR: '',
};

export default config;

export async function init() {
	// Pre-processing
	config.ROOT_DIR = await findRootDir();

	// Override from consumer's config
	const projectConfig = require(fsPath.join(config.ROOT_DIR, CONFIG_FILE));
	Object.assign(config, u(projectConfig, config));

	// Post-processing
	config.SCRIPTS_DIRS = [DEFAULT_SCRIPT_DIRS].concat(config.SCRIPTS_DIRS);
	config.ENV_FILES.forEach((envFile: string) => {
		if (!envFile.startsWith('/')) {
			// It's not an absolute path, create the directory
			envFile = path.resolve(config.ROOT_DIR, envFile);
		}
		const dotenvConfig = dotenv.config({ path: envFile });
		if (!dotenvConfig) { return; }
		Object.assign(config, dotenvConfig);
	});
}

