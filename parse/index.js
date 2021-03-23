const { getShare, post, question, unanswered, answer } = require('./parseContent')
const { getType, feedReason } = require('./parseHelpers')
const { tribe, user } = require('./parseProfile')

exports.parseFeed = (feed) => {
  const flatFeed = feed.edges.map(obj => obj.node.stories).flat()

  var content = []
  for(var obj of flatFeed) {
    const type = getType(obj)
    // Get share type, else get post type
    const parsedObj = type==='share' ? getShare(obj) : { post, question, answer }[type](obj[type])
    if ('question'===type) { parsedObj['user'] = feedReason(obj) }

    content.push(parsedObj)
  }
  return content
}


exports.parsePage = async (fullURL, type, contentObj) => {
  var parsedObj
  if (type === "tribeItem") {
    const type = getType(contentObj)
    parsedObj = type==='share' ? getShare(contentObj) : { post, question, answer }[type](contentObj[type])
  } else {
    parsedObj = ({ question, answer, tribe, user }[type])(contentObj)
  }
  return parsedObj
}
