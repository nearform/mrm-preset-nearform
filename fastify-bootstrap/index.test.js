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
const { install } = require('mrm-core/src/npm')
const { getTaskOptions } = require('mrm')

const task = require('./index')

const taskOptions = {
  appName: 'Test app name',
  appDescription: 'test description'
}

function getFilePath(filename) {
  return `${process.cwd()}/${filename}`
}

beforeEach(() => {
  fs.vol.reset()
})

describe('fastify-bootstrap task', () => {
  it('updates package.json', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('package.json')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('test-app-name')
    expect(files[filePath]).toMatch(taskOptions.appDescription)
  })

  it('initializes the README', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('README.md')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('test-app-name')
    expect(files[filePath]).toMatch(taskOptions.appDescription)
  })

  it('copies the static files', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()

    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(
        [
          '.github/workflows/ci.yml',
          '.github/dependabot.yml',
          'plugins/sensible.js',
          'plugins/support.js',
          'routes/root.js',
          'routes/example/index.js',
          'test/plugins/support.test.js',
          'test/routes/example.test.js',
          'test/routes/root.test.js',
          '.env.template',
          '.nvmrc',
          '.taprc',
          'app.js'
        ].map(filename => getFilePath(filename))
      )
    )
  })

  it('should install correctly dev dependencies', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    expect(install).toHaveBeenCalledWith(
      expect.arrayContaining(['husky', 'tap', 'standard', '@vercel/ncc'])
    )
  })
})
