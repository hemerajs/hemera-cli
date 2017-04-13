# Hemera-cli
[![js-standard-style](https://raw.githubusercontent.com/feross/standard/master/badge.png)](https://github.com/feross/standard)

## Install

```js
npm install -g hemera-cli
hemera-cli
```

## Commands

### Create basic plugin template

```
$ create plugin <name>
```
__Structure__
```
|   .eslintrc.js // Configure eslint
|   index.js // Create basic plugin functionality
|   package.json // Create package.json
|   README.md // Create README with example and getting started section
|
\---test // Create sample testsuite
        index.spec.js
```


### List services

List all available services in your network.

__Prerequisites__

You have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin.

```
$ connect
$ services
```


### List actions

List all available actions in your network.

__Prerequisites__

You have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin.
```
$ connect
$ actions
```