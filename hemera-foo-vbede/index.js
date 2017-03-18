'use strict'

exports.plugin = function hemeraFooVbede (options, next) {
  const hemera = this
  const topic = 'foo-vbede'

  hemera.add({
    topic,
    cmd: 'add'
  }, (req, cb) => {
    cb(null, req.a + req.b)
  })

  next()
}

exports.options = {}

exports.attributes = {
  pkg: require('./package.json'),
  dependencies: []
}
