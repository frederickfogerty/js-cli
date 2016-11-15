import * as path from 'path';
import * as fse from 'fs-extra-promise';
import * as bluebird from 'bluebird';



async function checkDirIsRoot(path: string) {
	const files = await fse.readdirAsync(path);
	let found = false;
	files.forEach(file => {
		if (file === 'js-cli-config.js') { found = true; }
	});

	return found;

}

async function findRootDir() {
	let dirPath = process.cwd();
	while (dirPath !== '/') {
		await bluebird.delay(1000);
		const isRoot = await checkDirIsRoot(dirPath);
		if (isRoot) { return dirPath; }

		dirPath = path.join(dirPath, '../');
		console.log('dirPath', dirPath);
	}

	throw new Error('Root directory not found. Have you created a \'js-cli-config.js\' file in the root of your project?');
}

export const ROOT_DIR = findRootDir();
