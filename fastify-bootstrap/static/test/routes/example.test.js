'use-strict'

const { test } = require('tap')
const { build } = require('../helper')

test('example is loaded', async t => {
  t.plan(1)

  const app = await build(t)

  const res = await app.inject({
    url: '/example'
  })
  t.equal(res.payload, 'this is an example')
})
