const { parseQContentObj, qContentText, qContentImg, getName, parseTime, sanitizeLink } = require('./parseQContent')

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
  var fr = obj.feedReason
  return fr.userNames && {
    name: getName(fr.userNames[0].names),
    pic: fr.userPhotos[0].profileImageUrl
  }
}

exports.conserved = obj => {
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
  return {
    text: qContentText(parseQContentObj(obj), 250),
    image: qContentImg(obj)
  }
}

exports.checkPrize = async v => {
  return typeof v!=='undefined' && 'edges' in v? await answer(v.edges[0].node) :false 
}

exports.getType = obj => {
  return  Object.keys(obj).filter(k => ["share", "post", "question", "answer", "hyperlink"].includes(k))[0]
}
