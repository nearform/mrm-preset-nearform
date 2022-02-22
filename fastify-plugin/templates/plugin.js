const fp = require('fastify-plugin')

function plugin(fastify, opts, next) {
  // your plugin code
  next()
}

module.exports = fp(plugin, {
  fastify: '${fastifyVersion}',
  name: '${packageName}'
})
