/*
  contains redundant functions that re-map content objects to our desired parsed object.
*/
const { parseQContentObj, qContentText, qContentImg, getName, parseTime, sanitizeLink } = require('./parseQContent')

exports.getType = obj => {
  // Determines content type by finding which exist among the given objects keys
  return  Object.keys(obj).filter(k => ["share", "post", "question", "answer", "hyperlink"].includes(k))[0]
}

exports.user = obj => {
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

exports.feedReason = obj => {
  // gets author Name, PFP. (mainly just for tribe-questions)
  var fr = obj.feedReason
  return fr.userNames && {
    name: getName(fr.userNames[0].names),
    pic: fr.userPhotos[0].profileImageUrl
  }
}

exports.conserved = obj => {
  // top level content conserved across many content types
  return {
    type: obj.__typename,
    url: sanitizeLink(obj.url||obj.permaUrl),
    unix: parseTime(obj.creationTime),
    space: (obj.tribeItem && {
      name: qContentText(obj.tribeItem.tribe.name),
      url: sanitizeLink(obj.tribeItem.tribe.url),
      image: obj.tribeItem.tribe.iconUrl
    })
  }
}

exports.content = obj => {
  // standard content getter for answers and posts
  return {
    text: qContentText(parseQContentObj(obj), 250),
    image: qContentImg(obj)
  }
}
