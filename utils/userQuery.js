const axios = require('axios')


// –> source <link as='script' rel='preload' href='https://qsbr.fs.quoracdn.net/-4-ans_frontend-relay-component-UserProfileTab-combined-27-0c328974018015f6.webpack' />
// –> https://qsbr.fs.quoracdn.net/-4-ans_frontend-relay-component-UserProfileTab-combined-27-0c328974018015f6.webpack
// –> params:{operationKind:"query",name:"UserProfileCombinedListQuery",id:"36c9966ed8929a13a7f204b3f19dc8006a4409588ced950dfb69bda81fb7766e"

async function userFeedQuery(content, session, lastQuery, feedAfter=false, question=false, depth=0) {
  const headers = {
    "quora-window-id": 'react_fxzcmzpriavrrdpd',
    "quora-formkey": 'e59ae13fc2fe1167230a89c7b053822c',
    "cookie": 'm-b=em-iLZNPxUBYBPWMaTaIZg==',
    "quora-revision": '37a9ef60d42f01f8fb4c40b7edd259e589c96ab7',
  }
  const data = {
    queryName:"UserProfileCombinedListQuery",
    extensions: {
      hash: '36c9966ed8929a13a7f204b3f19dc8006a4409588ced950dfb69bda81fb7766e'
    },
    variables: {
      uid: 21508824,
      order: 1,
      first: 3
    }
  }

  if (feedAfter) {
    data["variables"]["after"] = 0
  }

  var feed = await axios.post(
    "https://www.quora.com/graphql/gql_para_POST?q=UserProfileCombinedListQuery", 
    data, { headers: headers }
  )
  .then(res => {
    const queryInfo = res.data.data
    return queryInfo
  })
  .catch(err => {
    console.log('Qfeed GET Failed:', `${err.message}\n${new Date().getTime()}`)
  })

  // feed.user.names
  // feed.user.id
  // feed.user.uid
  // feed.user.pageInfo.hasNextPage
  // feed.user.pageInfo.endCursor
  // feed.user.combinedProfileFeedConnection.edges
  return feed //feed.user.combinedProfileFeedConnection.edges.map(edge => edge.node)
}

exports.userFeedQuery = userFeedQuery


const tmp = async () => {
  console.log(await userFeedQuery(0,0,0))
}
tmp()

