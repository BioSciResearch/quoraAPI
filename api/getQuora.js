const axios = require('axios')

function defaultReturn(fullURL, res) {
  return { url: fullURL, data: res }
}

// Takes callback, but defaults to await/then use
exports.getQuora = async (url, callback=defaultReturn) => {
  // Gets html via Quora url, designed to take quoraRouter as callback or future html parser
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
  return exports.getQuora(url).then(res => {
    console.log('done');  // console.log(res)
  })
}
/* tests.router = function () { 
  const {quoraRouter} = require('./quoraRouter')
  return module.exports.getQuora(url, quoraRouter).then(res => {
    console.log(res); console.log('done')
  })
} */

const genTest = (type, url) => async () => {
  const {quoraRouter} = require('./quoraRouter')
  return exports.getQuora(url, quoraRouter)
    .then(res => {
      console.log(res); console.log('done')
    })
    .catch(err => console.log(err))
}
  
const urls = Object.entries({
  answer: 'https://www.quora.com/Could-we-ever-create-infectious-vaccines/answer/Jennifer-Hu-1', // answer
  tribe: 'https://www.quora.com/q/quoraspacesupdates', // tribe
  user: 'https://www.quora.com/profile/Jeffrey-Brender', // user
  //unanswered: 'https://www.quora.com/unanswered/What-did-the-structure-of-DNA-s-double-helix-suggest-about-DNA-s-properties', // unanswered
  question: 'https://www.quora.com/Where-can-I-find-good-developers/', //question
  tribeItem: 'https://www.quora.com/q/coronaviruswatch/SARS-CoV-2-reactive-T-cells-in-healthy-donors-and-patients-with-COVID-19' // tribeItem
})
for([type, url] of urls) {
  tests[type] = genTest(type, url)
}

const { test } = require('../utils/test')
test(module)(tests)
