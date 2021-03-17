const {parseMatchObj} = require('./utils/parseMatchObj')
const {parseQContentObj, qContentText, qContentImg, getName, parseTime, sanitizeLink} = require('./utils/parseQContent')

/***   Helpers   ***/
const user = {
  // gets author Name, PFP, and credentials(if available)
  author: {
    _key: ['user'],
    names: ['name', getName],
    profileImageUrl: ['pic']
  },
  authorCredential:{
    translatedString:['user','cred']
  }
}

const feedReason = { 
  _key: ['question', 'user'],
  userNames: {0: { 
    names: ['name', getName]
  } },
  userPhotos: {0:{
    profileImageUrl: ['pic'],
  } },
}

const conserved = {
  __typename: ['type'],
  url: ['url', sanitizeLink],
  creationTime: ['unix', parseTime],
  ...user,
  tribeItem:{ tribe: { 
    _key: ['space'],
    name: ['name', parseQContentObj, qContentText],
    url: ['url', sanitizeLink],
    iconUrl: ['image']
  }}
}

const content = [
  parseQContentObj, // applied to subsequent values
  ['text', (v)=>qContentText(v, 250)],
  ['image', qContentImg]
]



/***   Content Types   ***/
const question = { 
  _key: ['question'],
  ...conserved,
  tribeItem: user,
  title: ['title', parseQContentObj, qContentText],
  sourceUrl: ['refLink'],
}

const answer = { 
  _key: ['answer'],
  ...conserved,
  question,
  content
}

const post = { 
  _key: ['post'],
  title: ['title', parseQContentObj, qContentText],
  ...conserved,
  content
}



/***   Share Types   ***/
const hyperlink = { 
  _key: ['hyper'],
  __typename: ['type'],
  imageUrls: ['image', (urlArr)=>urlArr[0]],
  publishTime: ['unix'],
  publisherSitename: ['site'],
  publisherIconUrl: ['favicon'],
  originalUrl: ['url'],
  title: ['title'],
  description: ['text']
}



function getType(obj) {
  return  Object.keys(obj).filter(k => ["share", "post", "question", "answer", "hyperlink"].includes(k))[0]
}


function getShare(obj) {
  const subtype = getType(obj.share)
  const share = {
    _key: ['share'],
    ...conserved,
  
    permaUrl: ['source', sanitizeLink],
    comment: ['comment', parseQContentObj, qContentText],
    embeddedContentUrl: ['refLink'],
    title: ['title'],

    [subtype]: (subtype==='share' ? getShare(obj.share) : {hyperlink, question, answer, post}[subtype])
  }
  return share
}



function parseFeed(feed, content, staticType=false) {
  const flatFeed = feed.edges.map(obj => obj.node.stories).flat()
  const space = {
    spaceName: content.name,
    spaceLink: content.url, 
    spaceImg: content.images.icon
  }
  
  var content = []
  for(var obj of flatFeed) {
    const type = staticType? staticType : getType(obj)

    const contentObj = type==='share'? getShare(obj) :{ post, question, answer }[type]
    //if(type==='share'){console.log(JSON.stringify(obj, null, 4))}
    var parseObjKey = {
      //__typename: ['type'],
      [type]: contentObj,
      ...( type==='question'&&{ feedReason } )
    }
    parseObjKey[type].creationTime = [parseTime, ['unix'], ['*', 'unix']] //expose time

    var parsedObj = {space, type, ...parseMatchObj(obj, parseObjKey)}
    parsedObj.user = parsedObj[type].user //expose top content user

    content.push(parsedObj); //console.log(parsedObj) //JSON.stringify(parseObjKey, null, 4) )
  }
  return content
}

exports.parseFeed = parseFeed
