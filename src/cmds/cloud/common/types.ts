export interface IDeployment {
  uid: string;
  name: string;
  url: string;
  created: string;
}

export interface IAlias {
  uid: string;
  alias: string;
  deploymentId: string;
  created: string;
}
