# @frederickfogerty/ts-boilerplate

> An opinionated npm module boilerplate with batteries included

## Features

- [Typescript](https://github.com/Microsoft/TypeScript)
- [Babel](https://github.com/babel/babel)
- Tests with [Jest](https://github.com/facebook/jest)
- Linting with [tslint](https://github.com/palantir/tslint)
- Package installs with [yarn](https://github.com/yarnpkg/yarn)
- .editorconfig to ensure consistent style
- Opinionated .gitignore included
- [np](https://github.com/sindresorhus/np) for npm, forked to use yarn


## API

`npm run [command]`

Available commands:
- **test**: test with Jest
- **np**: publish to npm using ynp, a fork of np
- **build**: build the project into `dist`
- **build:watch**: watch and incrementally build the project. Does not compile with babel.
- **lint**: lint the project using tslint

## Install

To use this boilerplate:

```sh
git clone https://github.com/frederickfogerty/ts-boilerplate
cd ts-boilerplate
rm -rf .git
git init
```

Then update the readme to your needs.


## License

MIT

