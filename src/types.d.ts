declare module 'toposort' {
	type Node = string | number;
	interface IToposort {
		array<T>(nodes: T[], edges: T[][]): T[];
		<T>(edges: T[][]): T[];
	}
	const Toposort: IToposort;
	export = Toposort;
}



declare module 'execa' {
	const execa: any;
	export = execa;
}




declare module 'listr' {
	import { Observable } from 'rxjs/Rx';

	namespace Listr {
		interface IListrTask {
			title: string;
			task: () => (Promise<any> | Listr | Observable<any>);
			skip?: Function;
		}
		interface ICustomRenderer {
			// constructor (tasks, options);
			render(): void;
			end(err: Error): void;
		}
		interface IListrOptions {
			renderer?: string | ICustomRenderer;
			concurrent?: boolean;
		}
	}
	class Listr {
		public constructor(tasks?: Listr.IListrTask[], options?: Listr.IListrOptions);
		public run(): Promise<void>;
		public add(task: IListrTask): Listr
	}
	export = Listr;
}




declare module 'fuzzy' {
	export interface IOptions {
		pre?: string;
		post?: string;
		extract: (el: any) => string;
	}
	export interface IMatch {
		index: number;
		original: string;
		score: number;
		string: string;
	}
	interface IFuzzy {
		filter: (pattern: string, list: string[], options?: IOptions) => IMatch[];
	}
	const fuzzy: IFuzzy;
	export = fuzzy;
}



declare module 'updeep';
