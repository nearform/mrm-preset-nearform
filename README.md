# Bench Template MRM Preset
This a tasks preset for the [mrm](https://mrm.js.org/) library, used to transform the [base bench template repository](https://github.com/nearform/bench-template)
into one of the following: 

1. `GitHub Action` project, by adding the following features:
    - an automatic GitHub release action
    - bundling on commit, set up with [@vercel/ncc](https://github.com/vercel/ncc)
    - tests with [jest](https://jestjs.io/) along with necessary linting changes and transpilation setup
2. ...

## Using this task
Simply run the following command in your project's root:

```shell
npx mrm $TASK_NAME --preset @nearform/bench-template --interactive
```

Where `$TASK_NAME` is one of the following: 
1. `github-action`.
2. ...

If this is the first time you're using `mrm` you will be asked for permission to install it, and the interactive setup 
will begin.

## Development
Assuming that the repository you're setting up is checked out next to this project, e.g.:
```
Users
  yourusername
    bench-template-mrm-preset
    repository-from-bench-template
```
and that your current working directory is:
```
/Users/yourusername/repository-from-bench-template
```

the easiest way to test the local version of this task is to reference it directly from the file system:

```shell
npx mrm github-action --preset ${PWD}/../bench-template-mrm-preset --interactive
```
