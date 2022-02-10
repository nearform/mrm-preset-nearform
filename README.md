# Bench Template GitHub Action MRM Task
This a task for the [mrm](https://mrm.js.org/) library, used to transform the [base bench template repository](https://github.com/nearform/bench-template)
into a `GitHub Action` project, by adding the following features:

- an automatic GitHub release action
- bundling on commit, set up with [@vercel/ncc](https://github.com/vercel/ncc)
- tests with [jest](https://jestjs.io/) along with necessary linting changes and transpilation setup

## Using this task
Simply run the following command in your project's root:

```shell
npx mrm @nearform/bench-template-github-action-mrm-task --interactive
```

If this is the first time you're using `mrm` you will be asked for permission to install it, and the interactive setup 
will begin.

## Development
The easiest way to test the local version of this task is to link it to your home directory (`mrm` checks it before 
searching `npm`):

```shell
mkdir -p ~/.mrm/@nearform
ln -s ${PWD} ~/.mrm/@nearform/bench-template-github-action-mrm-task
```

and then [use it as you would normally](#using-this-task).
