// mock the file system to allow reads from the actual files,
// but only allow writes to the in-memory one
jest.mock('fs', () => {
  const { readFileSync, readdirSync, statSync, existsSync } =
    jest.requireActual('fs')

  const memfs = require('memfs')

  return {
    ...memfs,
    readFileSync: (filename, options) => {
      // if a file exists in the memory fs return it first
      if (memfs.fs.existsSync(filename)) {
        return memfs.fs.readFileSync(filename, options)
      }

      return readFileSync(filename, options)
    },
    readdirSync,
    statSync,
    existsSync
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

const task = require('./index')

const taskOptions = {
  actionName: 'Test action name',
  actionDescription: 'test description'
}

function getFilePath(filename) {
  return `${process.cwd()}/${filename}`
}

beforeEach(() => {
  fs.vol.reset()
})

describe('github-action task', () => {
  it('creates an action.yml with name and description from parameters', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('action.yml')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch(taskOptions.actionName)
    expect(files[filePath]).toMatch(taskOptions.actionDescription)
  })

  it('updates package.json', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('package.json')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('github-action-test-action-name')
    expect(files[filePath]).toMatch(taskOptions.actionDescription)
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
    expect(files[filePath]).toMatch(taskOptions.actionName)
    expect(files[filePath]).toMatch(taskOptions.actionDescription)
  })

  it('copies the static files', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()

    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(
        [
          '.github/workflows/release.yml',
          'babel.config.cjs',
          'jest.config.cjs',
          '.eslintignore',
          'src/action.js',
          'src/action.test.js',
          'src/index.js',
          'dist/package.json'
        ].map(filename => getFilePath(filename))
      )
    )
  })
})
