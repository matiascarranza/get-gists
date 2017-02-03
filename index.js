#!/usr/bin/env node

/**
 * Module dependencies.
 */

const inquirer = require('inquirer')
const chalk = require('chalk')
const emoji = require('node-emoji')
const ora = require('ora')
const _ = require('lodash')
const args = require('args')

// custom libs imports
const github = require('./lib/github.js')
const download = require('./lib/download.js')

args
  .option(['t', 'token'], 'Github token')

const questions = [{
  type: 'input',
  message: 'Enter your github token',
  name: 'token'
}]

const flags = args.parse(process.argv)

const tokenSpn = ora('Connecting to github')

const start = (token) => {
  tokenSpn.start()
  github.authToken(token)

  setTimeout(() => {
    github.user()
    .catch((err) => {
      tokenSpn.fail()
      console.log(chalk.red(`Something went wrong -> ${err}`))
    })
    .then((user) => {
      tokenSpn.succeed()
      const gistsSpn = ora(`[1/2] Fetching ${user.login}'s gists`).start()
      github.gists().then((gists) => {
        gistsSpn.succeed()
        const downloadSpn = ora(`[2/2] Downloading gists into ${chalk.green(`${user.login}-gists`)} folder`).start()
        let downloadPromises = []
        _.forEach(gists, (gist) => {
          const files = gist.files
          _.forIn(files, (value) => {
            downloadPromises.push(download(value.raw_url, { directory: `${user.login}-gists`, filename: value.filename }))
          })
        })
        Promise.all(downloadPromises).then((data) => {
          downloadSpn.succeed()
          console.log(chalk.green(`Done! ${emoji.get(':rocket:')}`))
        })
        .catch((err) => {
          console.log(chalk.red(`Something went wrong -> ${err}`))
        })
      })
    })
    .catch((err) => {
      console.log(chalk.red(`Something went wrong -> ${err}`))
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
