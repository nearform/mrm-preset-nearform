'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('default root route', async t => {
  t.plan(1)

  const app = await build(t)

  const res = await app.inject({
    url: '/'
  })
  t.same(JSON.parse(res.payload), { root: true })
})
