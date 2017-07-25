import * as common from '../../common';
const { R, log, constants, config } = common;

export const name = 'const';
export const group = 'dev';
export const description = 'Lists the constants for the project.';

const LONGEST_KEY = Object.keys(constants).reduce(
	(a, b) => (a.length > b.length ? a : b),
).length;

function formatLeft(value: string): string {
	return `${value}${' '.repeat(LONGEST_KEY)}`.substr(0, LONGEST_KEY + 1);
}

function print(key: string, value: any) {
	let out: string = '';
	if (typeof value === 'string') {
		out = formatString(key, value);
	} else if (Array.isArray(value)) {
		out = formatArray(key, value);
	}
	if (out !== '') {
		log.info(out);
	}
}

function formatString(key: string, value: string) {
	const left = formatLeft(`${key}:`);
	return `  ${log.gray(left)} ${log.magenta(value)}`;
}

function formatArray(title: string, values: string[]) {
	return values
		.map((value, i) => {
			const left = i === 0 ? formatLeft(`${title}:`) : formatLeft(' ');
			return `  ${log.gray(left)} ${log.magenta(value)}`;
		})
		.join('\n');
}

export function cmd() {
	common.printTitle('Constants');
	const data = R.merge(constants, config);
	const items = Object.keys(data).map(key => ({
		key,
		value: (data as any)[key],
	}));

	// Simple values.
	// log.info.blue('Strings\n');
	items.forEach(item => print(item.key, item.value));

	// Arrays.
	// log.info.blue('\nArrays');
	// items
	// 	.filter(item => R.is(Array, item.value))
	// 	.forEach(item => printArray(item.key, item.value));

	log.info();
}
