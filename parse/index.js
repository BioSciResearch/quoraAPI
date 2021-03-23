/*
  Exports the two primary parsers of this library – a content feed parser and a single page parser.
  These call the same set of content parser functions to deconstructs and reformat the api response data.
*/

const { getShare, post, question, unanswered, answer } = require('./parseContent')
const { getType, feedReason } = require('./parseHelpers')
const { tribe, user } = require('./parseProfile')

exports.parseFeed = (feed) => {
  // receives feed object from userQuery or tribeQuery (their output is mostly the same)
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


exports.parsePage = async (type, contentObj) => {
  // receives type and content object from quoraRouter, it is then sent to the necessary parser functions
  var parsedObj
  if (type === "tribeItem") {
    const type = getType(contentObj)
    parsedObj = type==='share' ? getShare(contentObj) : { post, question, answer }[type](contentObj[type])
  } else {
    parsedObj = ({ question, answer, tribe, user }[type])(contentObj)
  }
  return parsedObj
}
