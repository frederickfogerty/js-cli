import * as fsPath from 'path';
import { Observable, Subject } from 'rxjs';
import * as childProcess from 'child_process';
import { log } from './log';


export interface IExec {
  code: number;
  cmd: string;
  stdout?: string;
  stderr?: string;
};


export interface IExecOptions {
  silent?: boolean;
  onExit?: Function;
};


export class ExecutionError extends Error {
  public code: number = 1;

  constructor(error: string = 'Error: Command failed', code?: number) {
    super(error);
    if (code) { this.code = code; }
  }

  public setCode(code: number): this {
    this.code = code;
    return this;
  }
}


/**
 * Executes the given shell command synchronously.
 * @param cmd: The command to invoke.
 * @param options: Options for the execution.
 */
export function exec(cmd: string, options: IExecOptions = {}): IExec {
  const silent = options.silent || false;
  let stdout: string = '';
  let code = 0;
  try {
    stdout = childProcess.execSync(cmd).toString();
    if (!silent) {
      log.info(stdout);
    }

  } catch (err) {
    const stderr = err.toString();
    code = err.status || 1;
    throw new ExecutionError(stderr).setCode(code);
  }
  return {
    code,
    cmd,
    stdout,
  };
}


/**
 * Executes the given command within the given directory.
 */
export function execWithin(path: string, cmd: string, options?: IExecOptions) {
  path = fsPath.resolve(path);
  return exec(`cd ${path} && ${cmd}`, options);
}



/**
 * Executes a process asynchronously
 */
export function execAsync(cmd: string, options: IExecOptions = {}): Promise<IExec> {
  return new Promise((resolve, reject) => {
    const silent = options.silent || false;
    const code = 0;
    const child = childProcess.exec(cmd, (err: any, stdout: string, stderr: string) => {
      if (err) {
        return reject({
          error: err,
          code: err.status || 1,
        });
      }
      resolve({
        code,
        cmd,
        stdout,
        stderr: stderr === '' ? undefined : stderr,
      });
    });

    // Stream output to the console unless silent is requested.
    if (!silent) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }

    // Kill the child when the parent process exits.
    process.on('exit', () => {
      if (options.onExit) {
        options.onExit();
      }
      child.kill();
    });
  });
}


/**
 * Executes the given command with a given directory asynchronously
 */
export async function execWithinAsync(path: string, cmd: string, options?: IExecOptions) {
  path = fsPath.resolve(path);
  return await execAsync(`cd ${path} && ${cmd}`, options);
}



/**
 * Executes the given command in the background as a observable.
 */
export function exec$(cmd: string): Observable<IExec> {
  let code = 0;
  const result = new Subject<IExec>();

  // Start the child-process.
  const child = childProcess.exec(cmd, (err: any, stdout: string, stderr: string) => {
    if (err) {
      code = err.status || 1;
      result.error(err);
    } else {
      result.complete();
    }
  });

  // Listen for data.
  const next = (stdout?: string, stderr?: string) => {
    if (stdout) {
      stdout = stdout.replace(/\n$/, '');
    }
    result.next({
      code,
      cmd,
      stdout,
      stderr,
    });
  };
  child.stdout.on('data', (chunk) => next(chunk.toString()));
  child.stderr.on('data', (chunk) => next(undefined, chunk.toString()));

  // Finish up.
  return result as Observable<IExec>;
}
