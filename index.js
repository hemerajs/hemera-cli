#!/usr/bin/env node

const vorpal = require('vorpal')()
const Hemera = require('nats-hemera')
const _ = require('lodash')
const Humanize = require('humanize')
const CliTable = require('cli-table')

let hemera = null

vorpal.command('clean', 'Clear the console')
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

    hemera.ready(() => {
      self.log('Connected to NATS Server')

      cb()
    })
  })
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
          table.push([service.app, Humanize.relativeTime(Humanize.time() - service.uptime), service.nodeEnv, Humanize.numberFormat(service.eventLoopDelay) + 'ms', Humanize.filesize(service.heapUsed), Humanize.filesize(service.rss), new Date(service.ts).toISOString()])
        })

        vorpal.ui.redraw('\n\n' + table.toString() + '\n\n')
      }

      hemera.act({
        topic: 'stats',
        cmd: 'processInfo'
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

      function patternToString (args) {
        if (_.isString(args)) {
          return args
        }

        args = args || {}
        let sb = []
        _.each(args, function (v, k) {
          if (!~k.indexOf('$') && !_.isFunction(v)) {
            sb.push(k + ':' + v)
          }
        })

        sb.sort()

        return sb.join(',')
      }

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

        vorpal.ui.redraw('\n\n' + table.toString() + '\n\n')
      }

      hemera.act({
        topic: 'stats',
        cmd: 'registeredActions'
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

vorpal.log('Welcome to the Hemera CLI!')
