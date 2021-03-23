const { unescapeJSON } = require('../utils/unescapeJson')
const { parsePage } = require('../parse');

function routeMatch(url, pattern){
  // Does given url match route pattern?
  return Boolean(url.match(pattern))
}

const routePatterns = Object.entries({
  answer: '/answer/',
  tribe: /\/q\/([^/]*?)[/]?$/,
  user: '/profile/',
  unanswered: '/unanswered/',
  question: /https:\/\/www.quora.com\/([^/]*?)[/]?$/,
  tribeItem: /\/q\/(.*?)\/(.*?)[/]?$/
  // tribeItem: { answer, post, question, share[share[...], hyperlink, answer, post, question] }
})


function getContent(html, type) {
  // Parse HTML string to get Content Object
  const pattern = RegExp(String.raw`(\"{\\"data\\":{\\"${type}\\":(.*?)}\");`) // RegExp(`(\\"{\\\\"data\\\\":{\\\\"${type}\\\\":(.*?)}\\");`)
  const dataObj = html.data.match(pattern)[1]
  const contentObj = unescapeJSON(dataObj).data[type]
  return contentObj
}


exports.quoraRouter = async (fullURL, html, test=false) => {
  // Given inputs from getQuora, determine page type by pattern matching the url
  // then, send html to appropriate page based parser.
  for ( let [type, pattern] of routePatterns ) {
    if ( routeMatch(fullURL, pattern) ) {
      if (test) {return type} else { console.log(type) }
      const contentObj = getContent(html, type)
      return parsePage(fullURL, type, contentObj) 
    }
  }
  console.log('failure route:', fullURL)
  return 'failed route'
}


/*** TESTS ***/
const urls = Object.entries({
  answer: 'https://www.quora.com/Could-we-ever-create-infectious-vaccines/answer/Jennifer-Hu-1', // answer
  tribe: 'https://www.quora.com/q/bioscience-club', // tribe
  user: 'https://www.quora.com/profile/Jeffrey-Brender', // user
  unanswered: 'https://www.quora.com/unanswered/What-did-the-structure-of-DNA-s-double-helix-suggest-about-DNA-s-properties', // unanswered
  question: 'https://www.quora.com/Where-can-I-find-good-developers/', //question
  tribeItem: 'https://www.quora.com/q/coronaviruswatch/SARS-CoV-2-reactive-T-cells-in-healthy-donors-and-patients-with-COVID-19' // tribeItem
})

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
