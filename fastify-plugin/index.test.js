jest.mock('fs', () => {
  const fs = jest.requireActual('fs')
  const memfs = require('memfs')

  const union =
    fn =>
    (filename, ...args) => {
      if (filename.includes(__dirname)) {
        return fs[fn](filename, ...args)
      }
      return memfs.fs[fn](filename, ...args)
    }

  return {
    ...memfs,
    readFileSync: union('readFileSync'),
    readdirSync: union('readdirSync'),
    statSync: union('statSync'),
    existsSync: union('existsSync')
  }
})

jest.mock('mrm-core/src/npm', () => ({
  install: jest.fn(),
  uninstall: jest.fn()
}))
jest.mock('mrm-core/src/util/log', () => ({
  added: jest.fn(),
  removed: jest.fn()
}))

const fs = require('fs')
const { getTaskOptions } = require('mrm')
const { install } = require('mrm-core/src/npm')

const task = require('.')

const taskOptions = {
  pluginName: 'Test plugin name',
  pluginDescription: 'test description',
  fastifyVersion: '3.x'
}

function getFilePath(filename) {
  return `${process.cwd()}/${filename}`
}

beforeEach(() => {
  fs.vol.reset()
})

describe('fastify-plugin task', () => {
  it('creates an index.js with plugin package name, fastify version from parameters', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('src/index.js')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('fastify-test-plugin-name')
    expect(files[filePath]).toMatch(taskOptions.fastifyVersion)
  })

  it('sets up jest', async () => {
    fs.vol.fromJSON({
      [getFilePath('.eslintrc')]: JSON.stringify({ extends: [], env: {} })
    })

    expect(install).not.toHaveBeenCalled()

    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const packagejson = JSON.parse(files[getFilePath('package.json')])

    expect(packagejson.scripts.test).toMatch('jest')
    expect(files[getFilePath('jest.config.cjs')]).not.toBeUndefined()
    expect(files[getFilePath('babel.config.cjs')]).not.toBeUndefined()
    expect(files[getFilePath('.eslintrc')]).toMatch('plugin:jest/recommended')
    expect(files[getFilePath('.eslintrc')]).toMatch('jest/globals')
    expect(files[getFilePath('.gitignore')]).toMatch(/coverage/s)
    expect(install).toHaveBeenCalledWith(
      expect.arrayContaining([
        '@babel/preset-env',
        'jest',
        'eslint-plugin-jest'
      ])
    )
  })

  it('updates package.json', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('package.json')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('fastify-test-plugin-name')
    expect(files[filePath]).toMatch(taskOptions.pluginDescription)
  })

  it('sets up the build script', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('.husky/pre-commit')
    const packagejson = JSON.parse(files[getFilePath('package.json')])

    expect(packagejson.scripts.build).toMatch('ncc build')
    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('npm run build')
    expect(install).toHaveBeenCalledWith(
      expect.arrayContaining(['@vercel/ncc'])
    )
  })

  it('initializes the README', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('README.md')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('fastify-test-plugin-name')
    expect(files[filePath]).toMatch(taskOptions.pluginDescription)
  })

  it('copies the static files', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()

    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(
        [
          '.nvmrc',
          '.github/workflows/release.yml',
          'src/plugin.test.js',
          'dist/package.json',
          'babel.config.cjs',
          'jest.config.cjs',
          '.eslintignore'
        ].map(filename => getFilePath(filename))
      )
    )
  })
})
