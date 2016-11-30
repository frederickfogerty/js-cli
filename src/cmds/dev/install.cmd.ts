import { R, run, constants, config, log, printTitle, time } from '../../common';

export const name = 'install';
export const group = 'dev';
export const alias = 'i';
export const description = 'Run yarn:install on all modules';
export const args = {};

export async function cmd() {
    printTitle('Installing dependencies');

    const cmd = config.USE_YARN ? 'yarn' : 'npm i';

    const modules = constants.MODULE_DIRS
        .toPackageObjects();
    await run.execOn(modules, cmd, { isConcurrent: true }).listr.run();

}
