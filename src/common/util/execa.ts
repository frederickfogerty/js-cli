import { execAsync } from './';
import { ExecFileOptions } from 'child_process';
import * as Execa from 'execa';
const streamToObservable = require('stream-to-observable');
const Observable = require('any-observable');
const split = require('split');


export const execa = (cmd: string, args?: string[], opts?: ExecFileOptions) => {
	// Use `Observable` support if merged https://github.com/sindresorhus/execa/pull/26
	const cp = Execa(cmd, args, opts);
	// cp.then((a) => console.log('a', cmd, args, a));

	return Observable.merge(
		streamToObservable(cp.stdout.pipe(split()), { await: cp }),
		streamToObservable(cp.stderr.pipe(split()), { await: cp })
	).filter(Boolean);
};
