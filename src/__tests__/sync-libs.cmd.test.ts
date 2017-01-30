import { getNewPackageObject } from '../cmds/dev/sync-libs.cmd';

it('syncs new versions into dependencies correctly', () => {
	const source = {
		name: 'source',
		path: undefined,
		package: {
			version: '1.0.1',
		},
		hasScript: undefined,
	} as any;

	const target = {
		name: 'target',
		path: undefined,
		package: {
			dependencies: {
				source: '1.0.0',
			},
		},
		hasScript: undefined,
	} as any;

	const actual = getNewPackageObject(source, target);
	expect((actual.dependencies as any).source).toEqual('1.0.1');
});
it('syncs new versions into devDependencies correctly', () => {
	const source = {
		name: 'source',
		path: undefined,
		package: {
			version: '1.0.1',
		},
		hasScript: undefined,
	} as any;

	const target = {
		name: 'target',
		path: undefined,
		package: {
			devDependencies: {
				source: '1.0.0',
			},
		},
		hasScript: undefined,
	} as any;

	const actual = getNewPackageObject(source, target);
	expect((actual.devDependencies as any).source).toEqual('1.0.1');
});
