import {
  fs,
  fsPath,
  execAsync,
  constants,
  log,
  printTitle,
  projectPath,
  time,
  listr,
} from '../../common';
import * as filesize from 'filesize';
import * as AdmZip from 'adm-zip';

export const group = 'dev';
export const name = 'build:webpack';
export const alias = 'wp';
export const description = 'Bundles webpack modules.';
export const args = {
  '--dev, -d': 'Build in `development` (default: production)',
};

export async function cmd(

  args: {
    options: {
      dev: boolean, d: boolean,
      prod: boolean, p: boolean,
    }
  }

) {
  // Setup initial conditions.
  const startedAt = time.timer();
  const tasks = [] as Array<IListrTask>;

  // Environment.
  const options = args.options || {};
  const isDev = options.dev || options.d || false;
  const NODE_ENV = isDev ? 'development' : 'production';
  printTitle(`Building WebPack (${log.magenta(NODE_ENV)})`);

  // Paths.
  const moduleDir = `${constants.LIBS_DIR}/client`;
  const outputDir = `${constants.SERVICES_DIR}/web/.build`;
  fs.ensureDirSync(outputDir);

  log.info.blue(`build:  ${log.magenta(projectPath(moduleDir))}`);
  log.info.blue(`target: ${log.magenta(projectPath(outputDir))}`);
  log.info();

  // Build Typescript.
  if (!isDev) {
    tasks.push({
      title: 'Build typescript',
      task: async () => {
        const cmd = `cd ${moduleDir} && export NODE_ENV=${NODE_ENV} && npm run build`;
        await execAsync(cmd, { silent: true });
      },
    });
  }

  // Bundle with webpack.
  tasks.push({
    title: 'Bundle with webpack',
    task: async () => {
      const script = `node lib/webpack --output ${outputDir} --run`;
      const cmd = `cd ${moduleDir} && export NODE_ENV=${NODE_ENV} && ${script}`;
      await execAsync(cmd, { silent: false });
    },
  });

  // Finish up.
  await listr(tasks).run();
  log.info();
  printSummary(outputDir);
  log.info.gray(`${startedAt.elapsed()} elapsed.`);
}



function printSummary(dir: string) {
  const toFileSize = (path: string) => {
    const stats = fs.statSync(path);
    const size = stats.size;
    return filesize(size);
  };

  const toZipSize = (path: string) => {
    const pathZipped = `${path}.zip`;
    const zip = new AdmZip();
    zip.addLocalFile(path);
    zip.writeZip(pathZipped);
    const size = toFileSize(pathZipped);
    fs.removeSync(pathZipped);
    return size;
  };

  fs
    .readdirSync(dir)
    .filter(name => name.endsWith('.js'))
    .forEach(name => {
      const path = fsPath.join(dir, name);
      log.info.green(name);
      log.info.green(` - ${toFileSize(path)}`);
      log.info.green(` - ${log.white(toZipSize(path))} (zipped)`);
      log.info();
    });
}
