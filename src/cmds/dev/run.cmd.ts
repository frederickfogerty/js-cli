import { R, run, constants, log, printTitle, time } from '../../common';

export const group = 'dev';
export const alias = 'r';
export const description = 'Run the given command on all modules.';
export const args = {
  '[script]': 'The name of the NPM script to run',
  '--test, -t': 'Flag indicating if a test run should be performed (default: false).',
};



export async function cmd(
  args: {
    params: Array<string>,
    options: {
      test?: boolean, t?: boolean;
    }
  }
) {

  // Setup initial conditions.
  const startedAt = time.timer();
  const isTest = args.options.test || args.options.t || false;

  const formatScript = (text: string): string => {
    switch (text.trim()) {
      case 'l': return 'lint';
      case 'b': return 'build';
      case 'pp': return 'prepublish';
      case 'npp': return 'prepublish';
      default: return text;
    }
  };

  // Determine the script to run.
  const script = formatScript(args.params.join(' '));
  const isScriptName = !script.startsWith('npm ');
  const cmd = isScriptName ? `npm run ${script}` : script;
  if (R.isEmpty(script)) {
    log.error('Please specify an NPM script to run.\n');
    return;
  }
  printTitle(`Running ${log.magenta(cmd)}`);

  // Retrieve the list of modules that have tests.
  let modules = constants
    .MODULE_DIRS
    .toPackageObjects()
    .filter(pkg => isScriptName ? pkg.hasScript(script) : true);
  await run.execOn(modules, cmd, { isConcurrent: true, isTest });

  if (modules.length === 0) {
    log.info.gray(`No modules with the script ${log.magenta(script)}.\n`);
  }

  // Finish up.
  log.info.gray(`\n${startedAt.elapsed()} elapsed.`);
}
