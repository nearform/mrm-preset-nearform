'use strict'

const fp = require('.')

describe('fastify-plugin', () => {
  it('should plugin be a function', () => {
    expect(typeof fp).toBe('function')
  })
})
