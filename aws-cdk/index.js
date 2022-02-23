const {
  template,
  lines,
  json,
  copyFiles,
  deleteFiles,
  install
} = require('mrm-core')
const path = require('path')

module.exports = function task({ projectName, projectDescription }) {
  const projectSlug = projectName.toLowerCase().replace(/ /g, '-')
  const projectId = projectName
    .replace(
      /(\w)(\w*)/g,
      (_, s1, s2) => `${s1.toUpperCase()}${s2.toLowerCase()}`
    )
    .replace(/ /g, '')

  template('bin/cdk.js', `${__dirname}/templates/bin.js`)
    .apply({ projectId })
    .save()

  deleteFiles('README.md')
  deleteFiles('index.js')
  copyFiles(`${__dirname}/static`, [
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
  ])

  const repositoryName = path.basename(process.cwd())
  const repositoryUrl = `https://github.com/nearform/${repositoryName}`

  json('package.json')
    .merge({
      name: projectSlug,
      description: projectDescription,
      main: 'dist/index.js',
      repository: {
        url: `git+${repositoryUrl}.git`
      },
      bugs: {
        url: `${repositoryUrl}/issues`
      },
      homepage: `${repositoryUrl}#readme`,
      scripts: {
        build:
          'esbuild src/index.js --bundle --minify --platform=node --target=node16 --outbase=src --outdir=dist',
        test: 'tap',
        cdk: 'cdk',
        deploy: 'npm run build && cdk deploy',
        'deploy:cd': 'npm run build && cdk deploy --require-approval never',
        diff: 'cdk diff',
        lint: 'eslint .',
        'lint:fix': 'eslint . --fix',
        synth: 'npm run build && cdk synth',
        prepare: 'husky install'
      }
    })
    .save()

  lines('.husky/pre-commit').add(['npm run build && git add dist']).save()

  lines('README.md')
    .set([`# ${projectSlug}`, projectDescription])
    .save()

  install([
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
  install(['aws-cdk-lib', 'constructs'], { dev: false })
}

module.exports.parameters = {
  projectName: {
    type: 'input',
    message: 'Project name',
    default: ''
  },
  projectDescription: {
    type: 'input',
    message: 'Project description',
    default: 'This is a aws lambda project'
  }
}
