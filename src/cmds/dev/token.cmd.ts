import { log, exec, fs, fsPath, constants } from '../../common';
import { fetchToken } from '../../common/fetch-auth-token';


export const group = 'dev';
export const name = 'auth-token';
export const description = 'Fetches a fresh auth token from Auth0 for a test user.';
export const alias = 'at';
// export const TOKEN_FILE_PATH = fsPath.join(constants.SCRIPTS_ROOT, '.build/.token.jwt');


export async function cmd(args: {}) {

	// Setup initial conditions.
	log.info('🕵🏻  Fetching token...');
	const jwt = await fetchToken();
	log.info.green(`👍🏻  Token fetched successfully.`);


	// Output token.
	const token: string = `Bearer ${jwt}`;
	log.info();
	log.info('Authorization');
	log.info(token);
	log.info();
	log.info.green('🙌🏻  The token body has been copied to your clipboard.');
	copyToClipboard(token);

	// Copy the token to disk.
	// NB: This is used when starting the UI Storybook.
	//   fs.writeFileSync(TOKEN_FILE_PATH, jwt);
};


const copyToClipboard = (value: string) => exec(`echo "${value}" | pbcopy`);
