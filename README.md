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

List all available services in your network.

#### Prerequisites

You have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin.

```
$ services
```


### List actions

List all available actions in your network.

#### Prerequisites

You have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin.
```
$ actions
```
