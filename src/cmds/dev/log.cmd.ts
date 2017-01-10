import { run, printTitle, constants, log, fsPath, fs } from '../../common';

export const group = 'dev';
export const name = 'log';
export const alias = 'l';
export const description = 'Tails the log file.';
export const args = {
  '--dev, -d': 'Flag indicating if the development log should be examine (default: production).',
};

export function cmd(
  args?: {
    params: string[],
    options: {
      prod?: boolean, p?: boolean;
      dev?: boolean, d?: boolean;
    },
  },
) {
  // Setup initial conditions.
  args = args || { params: [], options: {} };
  const dev = args.options.dev || args.options.d || false;
  printTitle(`Desktop App Log (${log.magenta(dev ? 'development' : 'production')})`);

  // Determine the path.
  const file = dev ? 'dev.log' : 'prod.log';
  const path = fsPath.join(constants.DESKTOP_LOG_DIR, file);
  fs.ensureFileSync(path);

  // Start tailing the log.
  const cmd = `tail -F ${path}`;
  log.info.blue(`CMD: ${log.magenta(cmd)}`);
  log.info();
  run
    .exec$(cmd)
    .forEach((e) => log.info(e.stdout));
}
