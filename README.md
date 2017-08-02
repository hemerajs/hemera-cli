# Hemera-cli
[![NPM Downloads](https://img.shields.io/npm/dt/hemera-cli.svg?style=flat)](https://www.npmjs.com/package/hemera-cli)
[![npm](https://img.shields.io/npm/v/hemera-cli.svg?maxAge=3600)](https://www.npmjs.com/package/hemera-cli)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## Install

```js
npm install -g hemera-cli
hemera-cli
```

## Commands

## Create basic plugin template

```
$ create plugin <name>
```
__Structure__
```
|   index.js // Create basic plugin functionality
|   package.json // Create package.json
|   README.md // Create README with example and getting started section
|
\---test // Create sample testsuite
        index.spec.js
```


## List services

List all available services in your network.

__Prerequisites__

You service have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin. Look at this [example](/example/test-server.js).

```
$ connect
$ services
```


## List actions

List all available actions in your network.

__Prerequisites__

You service have to use the [hemera-stats](https://github.com/hemerajs/hemera/tree/master/packages/hemera-stats) plugin. Look at this [example](/example/test-server.js).
```
$ connect
$ actions
```

## Start a request

Start a request against a server method and print the ouput in a coloured YAML-style, perfect for CLI output.

```
$ connect
$ act --pattern topic:math,cmd:add,a:2,b:44
$ result: 46
```
