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
  projectName: 'Test project name',
  projectDescription: 'test description'
}

function getFilePath(filename) {
  return `${process.cwd()}/${filename}`
}

beforeEach(() => {
  fs.vol.reset()
})

describe('aws-cdk task', () => {
  it('creates a aws-cdk project with a project name and description from parameters', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('bin/cdk.js')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('TestProjectName')
  })

  it('updates package.json', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('package.json')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('test-project-name')
    expect(files[filePath]).toMatch(taskOptions.projectDescription)
  })

  it('initializes the README', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()
    const filePath = getFilePath('README.md')

    expect(files[filePath]).not.toBeUndefined()
    expect(files[filePath]).toMatch('test-project-name')
    expect(files[filePath]).toMatch(taskOptions.projectDescription)
  })

  it('copies the static files', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    const files = fs.vol.toJSON()

    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(
        [
          '.github/workflows/ci.yml',
          '.github/dependabot.yml',
          '.env.sample',
          '.eslintignore',
          '.gitignore',
          '.npmignore',
          '.nvmrc',
          '.prettierrc',
          '.taprc',
          'cdk.json'
        ].map(filename => getFilePath(filename))
      )
    )
  })

  it('should install correctly dev dependencies', async () => {
    task(await getTaskOptions(task, false, taskOptions))

    expect(install).toHaveBeenCalledWith(
      expect.arrayContaining([
        'aws-cdk',
        'eslint',
        'esbuild',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        'husky',
        'lint-staged',
        'tap',
        'prettier'
      ])
    )
  })
})
