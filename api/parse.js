const {parseQContentObj, qContentText, qContentImg, getName, parseTime} = require('../utils/parseQContent')
const {unescapeJSON} = require('../utils/unescapeJson')
const {getQuora} = require('./getQuora')
// const [get, set] = [require('get-value'), require('set-value')]


const getAnswer = (fullURL, res) =>{
  var dataObj = res.data.match(/(\"{\\"data\\":{\\"answer\\":(.*?)}\");/)[1]
  const contentObj = unescapeJSON(dataObj).data["answer"]

  var parsedObj = {
    type: 'answer',
    content: {
      url: fullURL,
      unix: parseTime(contentObj.creationTime),
      title: qContentText(parseQContentObj(contentObj.question.title)),
      text: qContentText(parseQContentObj(contentObj.content, 250)),
      image: qContentImg(parseQContentObj(contentObj.content)),
    },
    user: {
      name: getName(contentObj.author.names),
      pic: contentObj.author.profileImageUrl,
    }
  }

  return parsedObj
}


const getPost = (fullURL, res) =>{
  var dataObj = res.data.match(/(\"{\\"data\\":{\\"tribeItem\\":(.*?)}\");/)[1]
  const contentObj = unescapeJSON(dataObj).data.tribeItem["post"]

  var parsedObj = {
    type: 'post',
    content: {
      url: fullURL,
      unix: parseTime(contentObj.creationTime),
      title: qContentText(parseQContentObj(contentObj.title)),
      text: qContentText(parseQContentObj(contentObj.content, 250)),
      image: qContentImg(parseQContentObj(contentObj.content)),
    },
    user: {
      name: getName(contentObj.author.names),
      pic: contentObj.author.profileImageUrl
    }
    // Add space
  }

  return parsedObj
}


async function answer(v) {
  if(typeof v === 'object') { //Object.keys(v).length > 0
    var url=v.permaUrl
    url = url[0] === '/'?'https://www.quora.com'+url:url
    return await getQuora(url, getAnswer)//(url)
  } else { 
    return false 
  }
}


async function checkPrize(v) { 
  return typeof v!=='undefined' && 'edges' in v? await answer(v.edges[0].node) :false 
}

function getExr(v) {
  return v.constructor===Object?'':v
}

const getUser = async (fullURL, res) => {
  //scrape and parse
  var dataObj = res.data.match(/(\"{\\"data\\":{\\"user\\":(.*?)}\");/)[1]
  const contentObj = unescapeJSON(dataObj).data["user"]

  var parsedObj = {
    type: 'user',
    content: {
      url: fullURL, // `https://www.quora.com/${contentObj.profileUrl}`
      blurb: qContentText(parseQContentObj(contentObj.description)),
      answers: {
        prized: await answer(contentObj.latestPrizeWinningAnswer), //await checkPrize(contentObj.latestPrizeWinningAnswer),
        recent: await answer(contentObj.recentPublicAndPinnedAnswersConnection) 
      }
    },
    user: {
      name: getName(contentObj.names),
      pic: contentObj.profileImageUrl,
      experience: getExr(contentObj.profileCredential.experience)
    }
  }
 
  return parsedObj
}


const getTribe = (fullURL, res) => {
  var dataObj = res.data.match(/(\"{\\"data\\":{\\"tribe\\":(.*?)}\");/)[1]
  const contentObj = unescapeJSON(dataObj).data["tribe"]

  var parsedObj = {
    type: 'tribe',
    content: {
      handle: contentObj.handle.substring(2),
      url: fullURL, // `https://www.quora.com${parsedObj.url}`
      //hash: contentObj.url.substring(3),
      tribeId: contentObj.tribeId,
      name: qContentText(parseQContentObj(contentObj.name)),
      blurb: qContentText(parseQContentObj(contentObj.description)),
      images: {
        cover: contentObj.coverPhotoUrl,
        icon: contentObj.iconUrl,
      }
    },
    user: {
      name: getName(contentObj.admins[0].names),
      pic: contentObj.admins[0].profileImageUrl
    }
  }

  return parsedObj
}



/* 
getQuora('https://www.quora.com/profile/Adam-DAngelo', getUser).then(
  res => console.log(res)
)

getQuora('https://www.quora.com/Will-Uber-dominate-the-home-food-delivery-market-—-restaurants-groceries-etc-Is-there-space-left-for-independent-companies-What-is-the-success-rate-of-UberEats/answer/Adam-DAngelo', getAnswer).then(
  res => console.log(res)
) 

getQuora('https://qr.ae/pNjM2H', getPost).then(
  res => console.log(res)
)

getQuora('https://www.quora.com/q/quoraspacesupdates?sort=recent', getTribe).then(
  res => console.log(res)
)
*/

module.exports = {
  getAnswer,
  getPost,
  getUser,
  getTribe
}

module.exports.routeParser = {
  answer: getAnswer,
  tribe: getTribe,
  user: getUser,
  unanswered: 'unanswered',
  question: 'question',
  tribeItem: 'TribeItem', // gonna have to make  special func for this to send it to the correct sub-type
}
