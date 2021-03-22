const { routeParser } = require('./parse.js');

function routeMatch(url, pattern){
  return Boolean(url.match(pattern))
}

const routes = Object.entries({
  answer: '/answer/',  // getAnswer(fullURL, res)
  tribe: /\/q\/([^/]*?)[/]?$/, // getTribe(fullURL, res)
  user: '/profile/',  // getUser(fullURL, res)
  unanswered: '/unanswered/', // 'unanswered'
  question: /https:\/\/www.quora.com\/([^/]*?)[/]?$/,  // 'question'
  tribeItem: /\/q\/(.*?)\/(.*?)[/]?$/ //tribeItem // answer, post, question, share[share, hyperlink, answer, post, question]
})


exports.quoraRouter = async (fullURL, feedItem, test=false) => {
  for ( let [type, pattern] of routes ) {
    if ( routeMatch(fullURL, pattern) ) {
      //console.log(`${type}`)
      return test ? type : routeParser[type](fullURL, feedItem) 
    }
  }
  console.log('failure route:', fullURL)
  return 'failed route'
}

/***   Tests   ***/
const urls = Object.entries({
  answer: 'https://www.quora.com/Could-we-ever-create-infectious-vaccines/answer/Jennifer-Hu-1', // answer
  tribe: 'https://www.quora.com/q/bioscience-club', // tribe
  user: 'https://www.quora.com/profile/Jeffrey-Brender', // user
  unanswered: 'https://www.quora.com/unanswered/What-did-the-structure-of-DNA-s-double-helix-suggest-about-DNA-s-properties', // unanswered
  question: 'https://www.quora.com/Where-can-I-find-good-developers/', //question
  tribeItem: 'https://www.quora.com/q/coronaviruswatch/SARS-CoV-2-reactive-T-cells-in-healthy-donors-and-patients-with-COVID-19' // tribeItem
})

/*** TESTS ***/
const tests = {}
tests.default = async function () {
  return await console.log('run')
}

const genTest = (type, url) => async () => {
  return await exports.quoraRouter(url, null, true).then(res=>{
    console.log(`${type}: `, res===type)
  })
}

for([type, url] of urls) {
  tests[type] = genTest(type, url)
}

const { test } = require('../utils/test')
test(module)(tests)
