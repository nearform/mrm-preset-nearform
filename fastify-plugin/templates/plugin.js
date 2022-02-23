import fp from 'fastify-plugin'

function plugin(fastify, opts, next) {
  // your plugin code
  next()
}

export default fp(plugin, {
  fastify: '${fastifyVersion}',
  name: '${packageName}'
})
