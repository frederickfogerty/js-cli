import {
  constants,
  execAsync,
  fs,
  fsPath,
  printTitle,
} from '../../common';


export const group = 'start';
export const name = 'storybook';
export const alias = 'ui';
export const description = 'Starts React Storybook.';

export async function cmd() {
  printTitle('StoryBook: Client Module');
  const path = fsPath.join(constants.LIBS_DIR, 'client');
  cleanDebugLog(path);
  await execAsync(`cd ${ path } && npm run ui`);
}


function cleanDebugLog(folder: string) {
  fs
    .readdirSync(folder)
    .filter(name => name.startsWith('npm-debug.log'))
    .map(name => fsPath.join(folder, name))
    .forEach(path => fs.removeSync(path));
}
