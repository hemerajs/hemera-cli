const Hemera = require('nats-hemera')
const HemeraJoi = require('hemera-joi')
const HemeraStats = require('hemera-stats')
const nats = require('nats').connect()

const hemera = new Hemera(nats, {
  name: 'math-node-' + process.argv[2],
  logLevel: 'info',
  load: {
    process: {
      sampleInterval: 100
    }
  }
})

hemera.use(HemeraStats)
hemera.use(HemeraJoi)

hemera.ready(() => {
  hemera.setOption('payloadValidator', 'hemera-joi')
  let Joi = hemera.joi

  hemera.add({
    topic: 'math',
    cmd: 'add',
    a: Joi.number().required()
  }, (req, cb) => {
    cb(null, {
      result: req.a + req.b
    })
  })
})
