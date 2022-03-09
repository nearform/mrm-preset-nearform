'use strict'

// See https://www.fastify.io/docs/latest/Routes/.
module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })
}
