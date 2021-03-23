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
  var fr = obj.feedReason
  return fr.userNames && {
    name: getName(fr.userNames[0].names),
    pic: fr.userPhotos[0].profileImageUrl
  }
}

const conserved = obj => {
  return {
    type: obj.__typename,
    url: sanitizeLink(obj.url),
    unix: parseTime(obj.creationTime),
    space: (obj.tribeItem && {
      name: qContentText(parseQContentObj(obj.tribeItem.tribe.name)),
      url: sanitizeLink(obj.tribeItem.tribe.url),
      image: obj.tribeItem.tribe.iconUrl
    })
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
    title: qContentText(parseQContentObj(obj.title)),
    refLink: obj.sourceUrl
  }
}

const answer = obj => { 
  return {
    ...conserved(obj),
    ...user(obj),
    question: question(obj.question),
    ...content(obj.content)
  }
}

const post = obj => { 
  return {
    title: qContentText(parseQContentObj(obj.title)),
    ...conserved(obj),
    ...user(obj),
    ...content(obj.content)
  }
}



/***   Share Types   ***/
const hyperlink = obj => { 
  return {
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



function getType(obj) {
  return  Object.keys(obj).filter(k => ["share", "post", "question", "answer", "hyperlink"].includes(k))[0]
}


function getShare(obj) {
  const subtype = getType(obj.share)
  var shareOG  = obj.share

  const share = {
    ...conserved,
    type: 'share',
    ...user(obj.share),
    source: sanitizeLink(shareOG.url),
    comment: qContentText(parseQContentObj(shareOG.comment)),
    refLink: shareOG.embeddedContentUrl, // only if user provided reference for question
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
    const parsedObj = type==='share' ? getShare(obj) : { post, question, answer }[type](obj[type])
    if ('question'===type) { parsedObj['user'] = feedReason(obj) }
    // if(type==='share'){console.log(JSON.stringify(obj, null, 4))}

    content.push(parsedObj); //console.log(parsedObj) //JSON.stringify(parseObjKey, null, 4) )
  }
  return content
}

exports.parseFeed = parseFeed
