const {
  template,
  lines,
  json,
  copyFiles,
  deleteFiles,
  install
} = require('mrm-core')
const path = require('path')

module.exports = function task({
  pluginName,
  pluginDescription,
  fastifyVersion
}) {
  const fastifySlug = pluginName.toLowerCase().replace(/ /g, '-')
  const packageName = `fastify-${fastifySlug}`

  template('./src/index.js', `${__dirname}/templates/plugin.js`)
    .apply({ packageName, pluginDescription, fastifyVersion })
    .save()

  deleteFiles('README.md')
  deleteFiles('index.js')
  copyFiles(`${__dirname}/static`, [
    '.github/workflows/release.yml',
    '.nvmrc',
    'dist/package.json',
    'babel.config.cjs',
    'jest.config.cjs',
    '.eslintignore',
    'src/plugin.test.js'
  ])

  const repositoryName = path.basename(process.cwd())
  const repositoryUrl = `https://github.com/nearform/${repositoryName}`

  json('package.json')
    .merge({
      name: packageName,
      description: pluginDescription,
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

  lines('.eslintignore').add(['dist']).save()
  lines('.gitignore')
    .add(['# Jest test coverage output', 'coverage', 'node_modules'])
    .save()
  lines('.npmignore')
    .add(['.gitattributes', '.gitignore', '.github', '.nyc_output', 'coverage'])
    .save()
  lines('.husky/pre-commit').add(['npm run build && git add dist']).save()
  lines('README.md')
    .set([`# ${packageName}`, pluginDescription])
    .save()

  install(['@babel/preset-env', '@vercel/ncc', 'eslint-plugin-jest', 'jest'])
  install(['fastify-plugin'], { dev: false })
}

module.exports.parameters = {
  pluginName: {
    type: 'input',
    message: 'Plugin name',
    default: 'Template'
  },
  pluginDescription: {
    type: 'input',
    message: 'Plugin description',
    default: 'This is a Fastify Plugin description'
  },
  fastifyVersion: {
    type: 'input',
    message: 'Fastify version',
    default: '3.x'
  }
}
