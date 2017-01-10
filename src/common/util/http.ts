import fetch from 'node-fetch';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
export interface IResponse<T> {
	ok: boolean;
	status: number;
	statusText?: string;
	type: string;
	url: string;
	data?: T;
}

export interface IHttpHeaders {
	[ id: string ]: string;
}


async function request<T>(
	method: HttpMethod,
	requestUrl: string,
	data?: Object,
	headers?: IHttpHeaders,
): Promise<IResponse<T>> {
	const payload = {
		method,
		body: data ? JSON.stringify(data) : undefined,
		headers: {},
	};
	if (data) {
		Object.assign(payload.headers, {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		});
	}
	if (headers) {
		Object.assign(payload.headers, headers);
	}

	const response = await fetch(requestUrl, payload);
	const { ok, status, statusText, type, url } = response;
	const result = { ok, status, statusText, type, url, data: undefined };
	if (ok) {
		result.data = await response.json();
	}
	return result;
}



function get<T>(url: string, headers?: IHttpHeaders): Promise<IResponse<T>> {
	return request<T>('GET', url, undefined, headers);
}

function put<T>(url: string, data?: Object, headers?: IHttpHeaders): Promise<IResponse<T>> {
	return request<T>('PUT', url, data, headers);
}

function post<T>(url: string, data?: Object, headers?: IHttpHeaders): Promise<IResponse<T>> {
	return request<T>('POST', url, data, headers);
}

function patch<T>(url: string, data?: Object, headers?: IHttpHeaders): Promise<IResponse<T>> {
	return request<T>('PATCH', url, data, headers);
}

function del<T>(url: string, headers?: IHttpHeaders): Promise<IResponse<T>> {
	return request<T>('DELETE', url, undefined, headers);
}


function headers(httpHeaders: IHttpHeaders) {
	return {
		get: <T>(url: string): Promise<IResponse<T>> => { return get<T>(url, httpHeaders); },
		put: <T>(url: string, data?: Object): Promise<IResponse<T>> => { return put<T>(url, data, httpHeaders); },
		post: <T>(url: string, data?: Object): Promise<IResponse<T>> => { return post<T>(url, data, httpHeaders); },
		patch: <T>(url: string, data?: Object): Promise<IResponse<T>> => { return patch<T>(url, data, httpHeaders); },
		delete: <T>(url: string): Promise<IResponse<T>> => { return del<T>(url, httpHeaders); },
		headers: (append: IHttpHeaders) => headers(Object.assign(httpHeaders, append)),
	};
}


export {
	get,
	put,
	post,
	patch,
	del as delete,
	headers,
}
export default { get, put, post, patch, delete: del, headers };



