const { lines, json, copyFiles, deleteFiles, install } = require('mrm-core')
const path = require('path')

module.exports = function task({
  appName,
  appDescription,
  isStandAloneApplication
}) {
  const appSlug = appName.toLowerCase().replace(/ /g, '-')

  deleteFiles('README.md')
  deleteFiles('app.js')
  copyFiles(`${__dirname}/static`, [
    '.github/workflows/ci.yml',
    '.github/dependabot.yml',
    'plugins/sensible.js',
    'plugins/support.js',
    'routes/root.js',
    'routes/example/index.js',
    'test/helper.js',
    'test/plugins/support.test.js',
    'test/routes/example.test.js',
    'test/routes/root.test.js',
    '.env.template',
    '.eslintrc',
    '.nvmrc',
    '.prettierrc',
    '.taprc',
    'app.js'
  ])

  if (isStandAloneApplication) {
    copyFiles(`${__dirname}/static`, 'server.js')
  }

  const repositoryName = path.basename(process.cwd())
  const repositoryUrl = `https://github.com/nearform/${repositoryName}`

  json('package.json')
    .merge({
      name: appSlug,
      description: appDescription,
      main: 'dist/index.js',
      repository: {
        url: `git+${repositoryUrl}.git`
      },
      bugs: {
        url: `${repositoryUrl}/issues`
      },
      homepage: `${repositoryUrl}#readme`,
      scripts: {
        test: 'tap',
        lint: 'eslint .',
        'lint:fix': 'eslint . --fix',
        ...(isStandAloneApplication
          ? {
              dev: 'node server.js',
              build: 'ncc build server.js --license licenses.txt'
            }
          : {
              dev: 'fastify start -w -l info -P app.js',
              build: 'ncc build app.js --license licenses.txt'
            })
      },
      'lint-staged': {
        '*.js': 'eslint --cache --fix'
      }
    })
    .save()

  lines('.gitignore')
    .add([
      'node_modules',
      'dist',
      '.env',
      'coverage',
      '.nyc_output',
      'logs',
      'vscode'
    ])
    .save()

  lines('.husky/pre-commit').add(['npm run build && npm run test']).save()
  lines('.eslintignore').add(['dist', 'node_modules']).save()

  lines('README.md')
    .set([`# ${appSlug}`, appDescription])
    .save()

  install([
    'eslint',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'husky',
    'lint-staged',
    'tap',
    'prettier',
    '@vercel/ncc'
  ])
  install(
    [
      'fastify',
      'fastify-cli',
      'fastify-cors',
      'fastify-env',
      'fastify-sensible',
      'fastify-plugin',
      'fastify-autoload',
      'fluent-json-schema'
    ],
    {
      dev: false
    }
  )
}

module.exports.parameters = {
  appName: {
    type: 'input',
    message: 'Application name',
    default: 'fastify application'
  },
  appDescription: {
    type: 'input',
    message: 'Description',
    default: 'This is the description'
  },
  isStandAloneApplication: {
    type: 'confirm',
    message: 'Turn the application into a standalone executable?',
    default: false
  }
}
