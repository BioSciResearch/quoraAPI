const {parseQContentObj, qContentText, qContentImg, getName, parseTime, getExr} = require('./parseQContent')
var quoraRouter, getQuora;

function importOnce() {
  // BS to avoid circular dependance of cross module recursive function.
  if (!quoraRouter && !getQuora) {
    getQuora = require('../api/getQuora').getQuora
    quoraRouter = require('../api/quoraRouter').quoraRouter
  }
}

async function getAnswer(v) {
  importOnce()
  if(typeof v === 'object' && v !== null) {  // Object.keys(v).length > 0
    var url=v.permaUrl
    url = url[0] === '/'?'https://www.quora.com'+url:url
    return await getQuora(url, )  // (url)
  } else { 
    return false 
  }
}

const getUser = async (contentObj) => {
  var parsedObj = {
    type: 'user',
    content: {
      url: `https://www.quora.com/${contentObj.profileUrl}`,
      blurb: qContentText(contentObj.description),
      answers: {
        prized: await getAnswer(contentObj.latestPrizeWinningAnswer), //await checkPrize(contentObj.latestPrizeWinningAnswer),
        // recent or pinned
        recent: await getAnswer(Object.values(contentObj.combinedProfileFeedConnection.edges[0].node)[0])
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


const getTribe = (contentObj) => {
  var parsedObj = {
    type: 'tribe',
    content: {
      handle: contentObj.handle.substring(2),
      url: `https://www.quora.com${contentObj.url}`,
      //hash: contentObj.url.substring(3),
      tribeId: contentObj.tribeId,
      name: qContentText(contentObj.name),
      blurb: qContentText(contentObj.description),
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
  user: getUser,
  tribe: getTribe,
  getAnswer
}
