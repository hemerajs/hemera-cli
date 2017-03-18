# Hemera-cli

## Install

```js
npm install -g hemera-cli
hemera-cli
```

### Create basic plugin template

```
$ create plugin user-profile
```
1. Create basic plugin functionality
2. Create package.json
3. Create README
4. Create sample test
5. Configure eslint

#### Structure
```
|   .eslintrc.js
|   index.js
|   package.json
|   README.md
|
\---test
        index.spec.js
```


### List services

#### Prerequisites

You have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin.

```
$ services
```
![Hemera](https://github.com/hemerajs/hemera-cli/blob/master/media/hemera-cli.png?raw=true)


### List actions

#### Prerequisites

You have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin.
```
$ actions
```
![Hemera](https://github.com/hemerajs/hemera-cli/blob/master/media/actions.png?raw=true)
