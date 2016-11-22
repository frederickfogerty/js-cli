import {
  env,
  http,
  IHttpHeaders,
  IResponse,
} from '../../../common';



/**
 * Curry authorization headers into REST methods.
 */
const vars = env.read();
const headers: IHttpHeaders = {
  Authorization: `Bearer ${vars.NOW_TOKEN}`,
};
const { get, put, post, patch, delete: del } = http.headers(headers);
export { get, put, post, patch, del as delete }
export { IResponse }



/**
 * Formats a URL for the Zeit:Now API.
 */
export const url = (path: string) => `https://api.zeit.co/now/${path}`;



/**
 * Gets the data for the given URL path.
 */
export async function getData<T>(path: string) {
  const response = await get<any>(url(path));
  return response.data[ path ] as T;
}
