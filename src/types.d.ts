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



interface IListrTask {
  title: string;
  task: Function;
  skip?: Function;
}
interface IListrOptions {
  concurrent?: boolean;
}
declare class Listr {
  public constructor(tasks?: IListrTask[], options?: IListrOptions);
  public run(): Promise<void>;
  public add(task: IListrTask): Listr
}
declare module 'listr' {
  const listr = Listr;
  export = listr;
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


