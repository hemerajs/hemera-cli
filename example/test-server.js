const Hemera = require('nats-hemera')
const HemeraJoi = require('hemera-joi')
const HemeraStats = require('hemera-stats')
const nats = require('nats').connect()

const hemera = new Hemera(nats, {
  name: 'math-node-' + process.argv[2],
  load: {
    sampleInterval: 1
  }
})

hemera.use(HemeraStats)
hemera.use(HemeraJoi)

hemera.ready(() => {
  let Joi = hemera.exposition['hemera-joi'].joi

  hemera.add({
    topic: 'math',
    cmd: 'add',
    a: Joi.number().required()
  }, (req, cb) => {
    cb(null, req.a + req.b)
  })
})
