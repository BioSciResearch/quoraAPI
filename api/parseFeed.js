const {parseQContentObj, qContentText, qContentImg, getName, parseTime, sanitizeLink} = require('../utils/parseQContent')

/***   Helpers   ***/
const user = obj => {
  // gets author Name, PFP, and credentials(if available)
  const auth  = obj.author
  return {
    user: {
      name: getName(auth.names),
      pic: auth.profileImageUrl,
      cred: obj.authorCredential.translatedString
    }
  }
}

const feedReason = obj => {
  return {
    //question:{
      user: {
        name: getName(obj.userNames[0].names),
        pic: obj.userPhotos[0].profileImageUrl
      }
    //}
  }
}

const conserved = obj => {
  const tribe = obj.tribeItem.tribe
  return {
    type: obj.__typename,
    url: sanitizeLink(obj.url),
    unix: parseTime(obj.creationTime),
    ...user(obj),
    space: {
      name: qContentText(parseQContentObj(tribe.name)),
      url: sanitizeLink(tribe.url),
      image: tribe.image
    }
  }
}

const content = obj => {
  return {
    text: qContentText(parseQContentObj(obj), 250),
    image: qContentImg(parseQContentObj(obj))
  }
}



/***   Content Types   ***/
const question = obj => { 
  return {
    ...conserved(obj),
    //...user(obj),
    ...feedReason(obj),
    title: qContentText(parseQContentObj(obj.title)),
    refLink: obj.sourceUrl
  }
}

const answer = obj => { 
  return {
    ...conserved(obj),
    question: question(obj),
    content: content(obj.content)
  }
}

const post = obj => { 
  return {
    title: qContentText(parseQContentObj(obj.title)),
    ...conserved(obj),
    content: content(obj.content)
  }
}



/***   Share Types   ***/
const hyperlink = obj => { 
  return {
    hyper: {
      type: obj.__typename,
      image: obj.imageUrls[0],
      unix: obj.publishTime,
      site: obj.publisherSitename,
      favicon: obj.publisherIconUrl,
      url: obj.originalUrl,
      title: obj.title,
      text: obj.description
    }
  }
}



function getType(obj) {
  return  Object.keys(obj).filter(k => ["share", "post", "question", "answer", "hyperlink"].includes(k))[0]
}


function getShare(obj) {
  const subtype = getType(obj.share)
  var shareOG  = obj.share
  const share = {
    ...conserved,
    source: sanitizeLink(shareOG.permaUrl),
    comment: qContentText(parseQContentObj(shareOG.comment)),
    refLink: shareOG.embeddedContentUrl,
    title: shareOG.title,

    shared: (subtype ==='share' ? getShare(shareOG.share) : { hyperlink, question, answer, post }[subtype](shareOG[subtype]))
  }
  return share
}



function parseFeed(feed) {

  const flatFeed = feed.edges.map(obj => obj.node.stories).flat()

  var content = []
  for(var obj of flatFeed) {
    const type = getType(obj)

    // Get share type, else get post type
    const parseObjKey = type==='share' ? getShare(obj[type]) : { post, question, answer }[type](obj[type])
    // if(type==='share'){console.log(JSON.stringify(obj, null, 4))}
    //parseObjKey.unix = parseTime(obj[type])

    var parsedObj = {type, content: parseObjKey}
    parsedObj.user = parsedObj.content.user //expose top content user
    parsedObj.unix = parsedObj.content.unix //expose top content user

    content.push(parsedObj); //console.log(parsedObj) //JSON.stringify(parseObjKey, null, 4) )
  }
  return content
}

exports.parseFeed = parseFeed
