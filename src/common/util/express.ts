import * as express from 'express';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';


interface IErrorStack {
	message: string;
	stack: string[];
}



/**
 * Turns an Error stack into a friendlier JSON value.
 */
function formatErrorStack(stack: string = ''): IErrorStack {
	const lines = stack.split('\n');
	const message = lines[0];
	lines.shift();
	return {
		message,
		stack: lines.map((line) => line.trim()),
	};
}


/**
 * Sends an HTTP error to the client, with full stack details
 * if running locally in development.
 */
export function sendError(code: number, res: express.Response, err: Error) {
	const error = IS_PRODUCTION ? err.message : formatErrorStack(err.stack);
	res.status(code).send({
		status: code,
		error,
	});
}
