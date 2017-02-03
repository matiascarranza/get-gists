const GitHubApi = require('github')
const Promise = require('bluebird')

const github = new GitHubApi({
  // optional
  debug: false,
  timeout: 3000,
  Promise
})

module.exports = {
  auth: (username, password) => {
    // basic
    github.authenticate({
      type: 'basic',
      username,
      password
    })
  },
  authToken: (token) => {
    github.authenticate({
      type: 'oauth',
      token,
    })
  },
  user: () => github.users.get({}),
  gists: () => github.gists.getAll({
    per_page: 1000,
  })
}
