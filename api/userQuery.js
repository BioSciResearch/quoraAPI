const axios = require('axios')


// –> source <link as='script' rel='preload' href='https://qsbr.fs.quoracdn.net/-4-ans_frontend-relay-component-UserProfileTab-combined-27-0c328974018015f6.webpack' />
// –> https://qsbr.fs.quoracdn.net/-4-ans_frontend-relay-component-UserProfileTab-combined-27-0c328974018015f6.webpack
// –> params:{operationKind:"query",name:"UserProfileCombinedListQuery",id:"36c9966ed8929a13a7f204b3f19dc8006a4409588ced950dfb69bda81fb7766e"

async function userFeedQuery(content, session, feedAfter=false, question=false, depth=0) {
  const headers = {
    "quora-window-id": session.windowId,
    "quora-formkey": session.formKey,
    "cookie": session.cookie,
    "quora-revision": session.revision,
  }

  const data = {
    queryName:"UserProfileCombinedListQuery",
    extensions: {
      hash: session.userQueryKey,
    },
    variables: {
      uid: content.userID,
      order: 1,
      first: 8
    }
  }

  if (feedAfter) {
    data["variables"]["after"] = feedAfter
  }

  var [feed, endCursor] = await axios.post(
    "https://www.quora.com/graphql/gql_para_POST?q=UserProfileCombinedListQuery", 
    data, { headers: headers }
  )
  .then(res => {
    return res.data.data.user.combinedProfileFeedConnection
  })
  .then(res => {
    console.log(res)
    const queryInfo = res.pageInfo // pageInfo: { hasNextPage: true, endCursor: '8583263101309667894' }
    const resFeed = res // Parse edges next (.edges.map(edge => edge.node))
    return [resFeed, queryInfo.hasNextPage?queryInfo.endCursor:'']
  })
  .catch(err => {
    console.log('Qfeed-user GET Failed:', `${err.message}\n${new Date().getTime()}`)
  })

  return [feed, endCursor]
}

exports.userFeedQuery = userFeedQuery



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
  console.log(await userFeedQuery(content, session))
}
test()
