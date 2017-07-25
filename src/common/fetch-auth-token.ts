import { exec, execaCommand, IResponse } from './util';
import * as common from './';
import * as util from './util';
import config from './config';

const REFRESH_URL = `https://${config.AUTH0_DOMAIN}/delegation`;

interface IAuth0Response {
	id_token: string;
}

export async function fetchToken(
	params: { refreshToken?: string } = {},
): Promise<string | null> {
	const refreshToken =
		(params && params.refreshToken) || config.AUTH0_REFRESH_TOKEN;
	if (!refreshToken) {
		throw new Error('Need a refresh token. Is your .env set up correctly?');
	}

	const payload = {
		client_id: config.AUTH0_CLIENT_ID,
		refresh_token: refreshToken,
		grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
		api_type: 'app',
	};

	let response: IResponse<IAuth0Response>;

	try {
		response = await util.http.post<IAuth0Response>(REFRESH_URL, payload);
		if (response.status === 200 && response.data) {
			return response.data.id_token;
		} else {
			util.log.error(
				`${response.status} Failed to refresh token. ${response.statusText}`,
			);
			throw new Error('Failed to fetch token');
		}
	} catch (error) {
		util.log.error(`Failed to refresh token. ${error.message}`);
	}
	return null;
}
