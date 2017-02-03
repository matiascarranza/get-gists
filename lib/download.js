const fs = require('fs')
const url = require('url')
const http = require('follow-redirects').http
const https = require('follow-redirects').https
const mkdirp = require('mkdirp')

module.exports = (fileUrl, options) => (
  new Promise((resolve, reject) => {
    let req
    const path = `${options.directory}/${options.filename}`

    if (url.parse(fileUrl).protocol === 'https:') {
      req = https
    } else {
      req = http
    }

    const request = req.get(fileUrl, (response) => {
      if (response.statusCode === 200) {
        mkdirp(options.directory, (err) => {
          if (err) {
            reject(err)
          }
          const file = fs.createWriteStream(path)
          response.pipe(file)
        })
      } else {
        reject(response)
      }

      response.on('end', () => {
        resolve(path)
      })

      request.setTimeout(3000, () => {
        request.abort()
        reject('Timeout')
      })
    }).on('error', (e) => {
      reject(e)
    })
  })
)
