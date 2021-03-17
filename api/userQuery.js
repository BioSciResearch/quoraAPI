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
      hash: session.tribeQueryKey,
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
    const queryInfo = res.data.data
    return queryInfo
  })
  .then(res => {
    const queryInfo = res.data.data.user.pageInfo // pageInfo: { hasNextPage: true, endCursor: '8583263101309667894' }
    const resFeed = res.data.data.user.combinedProfileFeedConnection // Parse edges next (.edges.map(edge => edge.node))
    return [resFeed, queryInfo.hasNextPage?queryInfo.endCursor:'']
  })
  .catch(err => {
    console.log('Qfeed-user GET Failed:', `${err.message}\n${new Date().getTime()}`)
  })

  return [feed, endCursor]
}

exports.userFeedQuery = userFeedQuery



const session = {
  windowId: 'react_fxzcmzpriavrrdpd',
  formKey: 'e59ae13fc2fe1167230a89c7b053822c',
  cookie: 'm-b=em-iLZNPxUBYBPWMaTaIZg==',
  revision: '37a9ef60d42f01f8fb4c40b7edd259e589c96ab7',
  tribeQueryKey: ,
  tribeQueryKey: '36c9966ed8929a13a7f204b3f19dc8006a4409588ced950dfb69bda81fb7766e'
}

const content = {userID: 21508824}

const test = async () => {
  console.log(await userFeedQuery(content, session))
}
test()
