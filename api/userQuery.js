const axios = require('axios')
const { query } = require('../utils/queryHelper')

async function userQuery(session, userID, options = {}) {
  // Given query token via session, get user content(Q&A etc.) by api
  const data = {
    queryName:"UserProfileCombinedListQuery",
    extensions: {
      hash: session.userQueryKey,
    },
    variables: {
      uid: userID,
      order: 1,
      first: 8
    }
  }

  if (options.feedAfter) {
    data["variables"]["after"] = options.feedAfter // + 1 ? idk...
  }

  return query(session, data)  // [feed, endCursor]
}

exports.userQuery = userQuery


const session = {
  cookie: 'm-b=BXiQlmu70a4S9VxwK742Mg==;',
  formKey: 'f5f6bd7980e0991ab650a86181db0bce',
  windowId: 'react_mdcldjbripgfetwb',
  revision: '669b86c9d74b0b7511008816f077e86c41232585',
  tribeQueryKey: 'e22046587ff2a4a13b9819f049c86f091772c336df24138553feff916ba6f3f5',
  userQueryKey: '36c9966ed8929a13a7f204b3f19dc8006a4409588ced950dfb69bda81fb7766e',
}

const content = {userID: 21508824}

const test = async () => {
  var feed = await userQuery(session, content.userID, {feedAfter: 2})

  console.log(feed[0].edges.map(edge=>edge.node))
}
test()
