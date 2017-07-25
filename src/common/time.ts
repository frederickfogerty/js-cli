import * as moment from 'moment';

export class Timer {
	public readonly startedAt: moment.Moment;
	constructor() {
		this.startedAt = moment();
	}

	public elapsedMsecs(): number {
		return moment().diff(this.startedAt);
	}

	public elapsed(): string {
		const secs = this.elapsedMsecs() / 1000;
		return `${Math.round(secs * 10) / 10}s`;
	}
}

/**
 * Creates a time object used to measure the time operations take.
 */
export function timer(): Timer {
	return new Timer();
}

/**
 * Retrieves a humanized version of elapsed time.
 */
export function elapsed(since: string | Date | moment.Moment) {
	const msecs = moment().diff(moment(since));
	return moment.duration(msecs).humanize();
}
