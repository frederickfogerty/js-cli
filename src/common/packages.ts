import config from './config';
import { R } from './libs';

export const startsWithOrgName = (name: string) => {
	return R.any((orgName: string) => name.startsWith(orgName), config.ORG_NAMES);
};
