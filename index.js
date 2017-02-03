#!/usr/bin/env node

/**
 * Module dependencies.
 */

const inquirer = require('inquirer')
const chalk = require('chalk')
const emoji = require('node-emoji')
const ora = require('ora')
//const gitConfig = require('git-config')
const _ = require('lodash')
const args = require('args')

// custom libs imports
const github = require('./lib/github.js')

//const gitInfo = gitConfig.sync()

args
  .option(['t', 'token'], 'Github token')

const questions = [{
  type: 'input',
  message: 'Enter your github token',
  name: 'token'
}]

const flags = args.parse(process.argv)

const tokenSpn = ora('Connecting to github')

const start = token => {
  tokenSpn.start()
  github.authToken(token)

  setTimeout(() => {
    github.user()
    .catch((err) => {
      tokenSpn.fail()
      console.log(chalk.red(`Something went wrong -> ${err}`))
    })
    .then((user) => {
      console.log(user)
      tokenSpn.succeed()
    })
  }, 0)
}

if (flags.token) {
  start(flags.token)
} else {
  inquirer.prompt(questions).then((answers) => {
    start(answers.token)
  })
}
