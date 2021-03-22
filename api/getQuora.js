const axios = require('axios')

function defaultReturn(fullURL, res) {
  return { url:fullURL, data:res }
}

// Takes callback, but defaults to await/then use
exports.getQuora = async (url, callback=defaultReturn) => {
  return await axios.get(encodeURI(url))
    .then(res => {
      const fullURL = res.request.connection._httpMessage.res.responseUrl
      return callback(fullURL, res)
    })
    .catch(err =>{
      console.log('Quora GET Failed:', `${err.message}\n${url}\n${Date.now()}`)
      console.log(err)
      return err
    })
}


/*** TESTS ***/
const tests = {}
var url = "https://www.quora.com/q/quoraspacesupdates"
tests.default = function () {
  return module.exports.getQuora(url).then(res => {
    console.log('done');  // console.log(res)
  })
}
tests.router = function () { 
  const {quoraRouter} = require('./quoraRouter')
  return module.exports.getQuora(url, quoraRouter).then(res => {
    console.log('done');  // console.log(res)
  })
}
const { test } = require('../utils/test')
test(module)(tests)
