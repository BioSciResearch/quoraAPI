/* Parse user source code, also get and and parse latest/prized answer */
const { getAnswer } = require('./getAnswer.js')
const { getQuora } = require('../getQuora')

const {parseMatchObj} = require('./utils/parseMatchObj')
const {parseQContentObj, qContentText, getName} = require('./utils/parseQContent')


function answer(v) {
  if(Object.keys(v).length > 0) {
    var url=v.permaUrl
    url = url[0] === '/'?'https://www.quora.com'+url:url
    return getQuora(url, getAnswer)//(url)
  } else { 
    return false 
  }
}

exports.getUser = async (fullURL, res) => {
  //scrape and parse
  var tribeObj = res.data.match(/(\"{\\"data\\":{\\"user\\":(.*?)}\");/)[1]
  var parseObjKey = {
    data: {
      user: {
        profileImageUrl: ['user', 'pic'],
        names: ['user', 'name', getName],
        profileUrl: ['content', 'url', (extension)=>`https://www.quora.com/${extension}`],
        profileCredential: {
          experience: ['content', 'experience', 
          (v) => v.constructor===Object?'':v]
        },
        description: ['content', 'blurb', parseQContentObj, qContentText],
        latestPrizeWinningAnswer: ['content', 'answers', 'prized', answer],
        recentPublicAndPinnedAnswersConnection: ['content', 'answers', 'recent', 
          (v) => { return v.edges.length? answer(v.edges[0].node) :false }
        ]
      }
    }
  }
  var parsedObj = parseMatchObj(tribeObj, parseObjKey);
  // resolve promises
  var answers = parsedObj.content.answers
  answers.recent = await answers.recent 
  answers.prized = await answers.prized
  parsedObj.type = 'user'
  // return
  return parsedObj
}
