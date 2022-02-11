const {
  template,
  lines,
  json,
  copyFiles,
  deleteFiles,
  install
} = require('mrm-core')
const path = require('path')

module.exports = function task({ actionName, actionDescription }) {
  template('action.yml', `${__dirname}/templates/action.yml`)
    .apply({ actionName, actionDescription })
    .save()

  deleteFiles('README.md')
  deleteFiles('index.js')
  copyFiles(`${__dirname}/static`, [
    '.github/workflows/release.yml',
    'babel.config.cjs',
    'jest.config.cjs',
    '.eslintignore',
    'src/action.js',
    'src/action.test.js',
    'src/index.js',
    'dist/package.json'
  ])

  const actionSlug = actionName.toLowerCase().replace(/ /g, '-')
  const packageName = `github-action-${actionSlug}`

  const repositoryName = path.basename(process.cwd())
  const repositoryUrl = `https://github.com/nearform/${repositoryName}`

  json('package.json')
    .merge({
      name: packageName,
      description: actionDescription,
      main: 'dist/index.js',
      repository: {
        url: `git+${repositoryUrl}.git`
      },
      bugs: {
        url: `${repositoryUrl}/issues`
      },
      homepage: `${repositoryUrl}#readme`,
      scripts: {
        test: 'jest',
        build: 'ncc build src --license licenses.txt'
      }
    })
    .save()

  json('.eslintrc')
    .merge({
      extends: ['plugin:jest/recommended'],
      env: { 'jest/globals': true }
    })
    .save()

  lines('.gitignore').add(['# Jest test coverage output', 'coverage']).save()

  lines('.husky/pre-commit').add(['npm run build && git add dist']).save()

  lines('README.md')
    .set([`# ${actionName} GitHub Action`, actionDescription])
    .save()

  install(['@babel/preset-env', '@vercel/ncc', 'eslint-plugin-jest', 'jest'])
  install(['@actions/core', '@actions/github'], { dev: false })
}

module.exports.parameters = {
  actionName: {
    type: 'input',
    message: 'Action name',
    default: 'Template'
  },
  actionDescription: {
    type: 'input',
    message: 'Action description',
    default: 'This is a GitHub Action template'
  }
}
