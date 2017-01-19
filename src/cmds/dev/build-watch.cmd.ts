import {
	fs,
	fsPath,
	run,
	constants,
	log,
	printTitle,
	config,
} from '../../common';
import * as chokidar from 'chokidar';
import * as babelCore from 'babel-core';


export const group = 'dev';
export const name = 'build:watch';
export const alias = 'bw';
export const description = 'Starts TypeScript/Babel build-watchers for all modules.';

const hasBabel = (pkg: constants.IPackageObject) => fs.existsSync(fsPath.join(pkg.path, '.babelrc'));

const TS_MODULES = constants
	.MODULE_DIRS
	.toPackageObjects()
	.filter((pkg) => pkg.name.startsWith(config.ORG_NAME))
	.filter((pkg) => fs.existsSync(fsPath.join(pkg.path, 'tsconfig.json')));


export function cmd() {
	printTitle('TypeScript/Babel Build Watchers');

	// Print list.
	TS_MODULES.forEach((pkg) => {
		// console.log('pkg', pkg);
		log.info.blue(` - ${log.magenta(pkg.name)}${hasBabel(pkg) ? log.yellow(` (babel)`) : ''}`);
	});
	log.info();

	// Start the watchers.
	TS_MODULES.forEach((pkg) => {
		watchTypescript(pkg);
		// console.log('pkg.name', pkg.name);
		// console.log('pkg.path', pkg.path);
		if (hasBabel(pkg)) { watchBabel(pkg); }
	});
}



function watchTypescript(pkg: constants.IPackageObject) {
	const cmd = `cd ${pkg.path} && yarn run build:watch`;
	run
		.exec$(cmd)
		.forEach((e) => {
			const stdout = (e.stdout || '').replace(/\n$/, '');
			const prefix = stdout.includes('error')
				? log.red(`\n💥  TypeScript Error in ${log.yellow(pkg.name)}`)
				: log.blue(pkg.name);
			log.info(`${prefix} ${stdout}`);
		});
}



function watchBabel(pkg: constants.IPackageObject) {
	// Setup initial conditions.
	const tsconfig = require(fsPath.join(pkg.path, 'tsconfig.json'));
	const tsDir = fsPath.join(pkg.path, tsconfig.compilerOptions.outDir);

	// Build: TS => ES5 (babel).
	const buildBabel = (inputFile: string) => {
		const fileName = fsPath.basename(inputFile, '.js');
		const relativeDir = fsPath.dirname(inputFile.substr(tsDir.length, inputFile.length));
		const sourceDir = fsPath.dirname(inputFile);
		const targetDir = fsPath.join(pkg.path, 'lib', relativeDir);
		const targetFile = fsPath.join(targetDir, `${fileName}.js`);

		// Transpile and save JS.
		const js = babelCore.transformFileSync(inputFile).code;
		fs.outputFileSync(targetFile, js);

		// Copy the typescript definition file.
		fs.copySync(
			fsPath.join(sourceDir, `${fileName}.d.ts`), // from.
			fsPath.join(targetDir, `${fileName}.d.ts`),  // to.
		);

		log.info.yellow(`  [babel] ${pkg.name} ${log.gray(fsPath.join(relativeDir, `${fileName}.js`))}`);
	};

	// Watch for files in the tempoarary typescript build folder.
	chokidar
		.watch(`${tsDir}/**/*.js`)
		.on('change', (path) => buildBabel(path));
}
