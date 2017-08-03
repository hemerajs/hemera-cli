#!/usr/bin/env node

const vorpal = require('vorpal')()
const Hemera = require('nats-hemera')
const _ = require('lodash')
const Humanize = require('humanize')
const CliTable = require('cli-table')
const Dot = require('dot')
const Fs = require('fs')
const Path = require('path')
const CamelCase = require('camelcase')
const Prettyjson = require('prettyjson')
const EOL = require('os').EOL

let hemera = null

vorpal.command('create plugin <name>', 'Create basic plugin template').action(function (args, cb) {
  if (Fs.existsSync('./' + 'hemera-' + args.name)) {
    return cb(new Error('Directory "' + 'hemera-' + args.name + '" already exists, try a different project name'))
  }
  const rootPath = Path.join(Path.resolve(__dirname))
  const currentRoot = Path.join('./', 'hemera-' + args.name)
  Dot.templateSettings.strip = false
  Dot.templateSettings.varname = 'data'

  // plugin
  const tpl = Fs.readFileSync(Path.join(rootPath, 'templates', 'plugin.jst'))
  let pluginName = CamelCase(args.name)
  const pluginTpl = Dot.template(tpl)
  Fs.mkdirSync(currentRoot)
  Fs.writeFileSync(Path.join(currentRoot, 'index.js'), pluginTpl({
    name: pluginName.charAt(0).toUpperCase() + pluginName.slice(1),
    topic: args.name
  }))

  // package.json
  const pack = Fs.readFileSync(Path.join(rootPath, 'templates', 'package.jst'))
  const packTpl = Dot.template(pack)
  Fs.writeFileSync(Path.join(currentRoot, 'package.json'), packTpl({
    name: args.name
  }))

  // README
  const readme = Fs.readFileSync(Path.join(rootPath, 'templates', 'readme.jst'))
  const readmeTpl = Dot.template(readme)
  Fs.writeFileSync(Path.join(currentRoot, 'README.md'), readmeTpl({
    name: 'hemera-' + args.name,
    topic: args.name
  }))

  // test directory
  Fs.mkdirSync(Path.join(currentRoot, 'test'))

  // test example
  const testsuite = Fs.readFileSync(Path.join(rootPath, 'templates/test.jst'))
  const testsuiteTpl = Dot.template(testsuite)
  Fs.writeFileSync(Path.join(currentRoot, 'test', 'index.spec.js'), testsuiteTpl({
    name: 'hemera-' + args.name,
    topic: args.name
  }))

  this.log('Plugin created! ' + Path.resolve(currentRoot))

  cb()
})

vorpal.command('clean', 'Clear the console')
  .alias('cls')
  .action(function (args, cb) {
    process.stdout.write('\u001B[2J\u001B[0;0f')
    cb()
  })

vorpal.command('connect', 'Connect to NATS Server').action(function (args, cb) {
  var self = this

  var promise = this.prompt([{
    type: 'input',
    name: 'NATS_URL',
    default: 'nats://localhost:4222',
    message: 'NATS Server Url: '
  },
  {
    type: 'input',
    name: 'NATS_USER',
    default: '',
    message: 'Username: '
  }, {
    type: 'password',
    name: 'NATS_PW',
    default: '',
    message: 'Password: '
  }
  ])

  promise.then(function (answers) {
    const nats = require('nats').connect({
      'url': answers.NATS_URL,
      'user': answers.NATS_USER,
      'pass': answers.NATS_PW
    })

    hemera = new Hemera(nats, {
      crashOnFatal: false
    })

    hemera.on('error', (err) => self.log(err))

    hemera.ready(() => {
      self.log('Connected to NATS Server')
      cb()
    })
  })
})

vorpal.command('act', 'Start a request')
  .option('-p, --pattern <pattern>', 'String pattern of the action')
  .types({
    string: ['p', 'pattern']
  })
  .validate(function (args) {
    if (hemera) {
      return true
    } else {
      return 'Please connect at first with the NATS server'
    }
  })
  .action(function (args, callback) {
    hemera.act(args.options.pattern, (err, resp) => {
      vorpal.ui.redraw.clear()
      vorpal.ui.redraw(Prettyjson.render(err || resp))
    })
    callback()
  })

vorpal.command('services', 'List all available services of your network')
  .validate(function (args) {
    if (hemera) {
      return true
    } else {
      return 'Please connect at first with the NATS server'
    }
  })
  .action(function (args, callback) {
    const self = this
    const services = []

    function drawProcessTable (resp) {
      const table = new CliTable({
        head: ['Service', 'Uptime', 'Env', 'LoopDelay', 'Heap', 'Rss', 'Date']
      })

      const index = _.findIndex(services, function (o) {
        return o.app === resp.app
      })

      if (index !== -1) {
        services[index] = resp
      } else {
        services.push(resp)
      }

      _.each(services, (service) => {
        console.log(service)
        table.push([
          service.app,
          Humanize.relativeTime(Humanize.time() - service.uptime),
          service.nodeEnv || '', // #2 undefined values will crash it
          Humanize.numberFormat(service.eventLoopDelay) + 'ms',
          Humanize.filesize(service.heapUsed),
          Humanize.filesize(service.rss),
          new Date(service.ts).toISOString()
        ])
      })
      vorpal.ui.redraw.clear()
      vorpal.ui.redraw(EOL + table.toString() + EOL)
    }

    hemera.act({
      topic: 'stats',
      cmd: 'processInfo',
      maxMessages$: -1
    }, function (err, resp) {
      if (err) {
        callback()
        if (err.name === 'TimeoutError') {
          return self.log('No services available!')
        } else {
          return self.log(err)
        }
      }
      drawProcessTable(resp)
      callback()
    })
  })

vorpal.command('actions', 'List all available actions of your network')
  .validate(function (args) {
    if (hemera) {
      return true
    } else {
      return 'Please connect at first with the NATS server'
    }
  })
  .action(function (args, callback) {
    const self = this
    const services = []

    function drawActionTable (resp) {
      const table = new CliTable({
        head: ['Pattern', 'Service', 'Plugin']
      })

      const index = _.findIndex(services, function (o) {
        return o.app === resp.app
      })

      if (index !== -1) {
        services[index] = resp
      } else {
        services.push(resp)
      }

      _.each(services, (service) => {
        _.each(service.actions, (act) => {
          const pattern = patternToString(act.pattern)
          const entry = {}
          entry[pattern] = [service.app, act.plugin]
          table.push(entry)
        })
      })
      vorpal.ui.redraw.clear()
      vorpal.ui.redraw(EOL + table.toString() + EOL)
    }

    hemera.act({
      topic: 'stats',
      cmd: 'registeredActions',
      maxMessages$: -1
    }, function (err, resp) {
      if (err) {
        callback()
        if (err.name === 'TimeoutError') {
          return self.log('No services available!')
        } else {
          return self.log(err)
        }
      }
      drawActionTable(resp)
      callback()
    })
  })

vorpal
  .show()
  .parse(process.argv)

vorpal.log('Welcome to the Hemera CLI! v' + require('./package.json').version)

function patternToString (args) {
  if (_.isString(args)) {
    return args
  }

  args = args || {}
  let sb = []
  _.each(args, function (v, k) {
    if (!~k.indexOf('$') && !_.isFunction(v) && !_.isObject(v)) {
      sb.push(k + ':' + v)
    }
  })

  sb.sort()

  return sb.join(',')
}
