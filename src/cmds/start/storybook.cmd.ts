import { fetchToken } from '../../common/fetch-auth-token';
import { execaCommand, IExecOptions } from '../../common/util';
import {
	constants,
	execAsync,
	fs,
	fsPath,
	printTitle,
	log,
} from '../../common';

export const group = 'start';
export const name = 'storybook';
export const alias = 'ui';
export const description = 'Starts React Storybook.';

export async function cmd(args: {
	options: {
		noAuth: boolean,
	},
}) {
	printTitle('StoryBook: Client Module');
	const path = fsPath.join(constants.LIBS_DIR, 'client');
	cleanDebugLog(path);

	let authToken: string | null | undefined;
	if (!args.options.noAuth) {
		authToken = await fetchToken();
	}

	let cmd: string = '';
	if (authToken) { cmd += `export STORYBOOK_ID_TOKEN=${authToken} && `; }
	cmd += `cd ${path} && yarn run ui`;

	log.info.green(cmd);

	await execAsync(cmd);
}


function cleanDebugLog(folder: string) {
	fs
		.readdirSync(folder)
		.filter((name) => name.startsWith('npm-debug.log'))
		.map((name) => fsPath.join(folder, name))
		.forEach((path) => fs.removeSync(path));
}
