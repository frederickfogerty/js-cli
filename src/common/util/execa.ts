import { execAsync } from './';
import { ExecFileOptions } from 'child_process';
import * as Execa from 'execa';
const streamToObservable = require('stream-to-observable'); // tslint:disable-line
const Observable = require('any-observable'); // tslint:disable-line
const split = require('split'); // tslint:disable-line
const observableToPromise = require('observable-to-promise'); // tslint:disable-line


export const execa = (cmd: string, args?: string[], opts?: ExecFileOptions) => {
	// Use `Observable` support if merged https://github.com/sindresorhus/execa/pull/26
	const cp = Execa(cmd, args, opts);

	return Observable.merge(
		streamToObservable(cp.stdout.pipe(split()), { await: cp }),
		streamToObservable(cp.stderr.pipe(split()), { await: cp }),
	).filter(Boolean);
};

/**
 * Executes a command by splitting it into the relevant file and arg sections
 */
export const execaCommand = (cmd: string, opts: ExecFileOptions & { promise?: boolean } = {}) => {
	// const commands = cmd.split(' ');
	// const file = commands[0];
	// const args = commands.slice(1);
	const cp = Execa.shell(cmd, opts);

	const data$ = Observable.merge(
		streamToObservable(cp.stdout.pipe(split()), { await: cp }),
		streamToObservable(cp.stderr.pipe(split()), { await: cp }),
	).filter(Boolean);

	if (opts.promise) {
		return observableToPromise(data$);
	} else {
		return data$;
	}
};
