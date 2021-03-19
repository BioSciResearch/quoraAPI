const axios = require('axios')

const queryUrl = "https://www.quora.com/graphql/gql_para_POST?q="
const types = {
  UserProfileCombinedListQuery: "user",
  MultifeedQuery: "tribe"
}
const paths = {
  UserProfileCombinedListQuery: res => res.data.data.user.combinedProfileFeedConnection,
  MultifeedQuery: res => res.data.data.multifeedObject.multifeedConnection
}

async function query(data, headers) {
  var type = data.queryName
  var [feed, endCursor]  = await axios.post(
    queryUrl+type, data, { headers }
  )
    .then(paths[type])
    .then(res => {
      const queryInfo = res.pageInfo // pageInfo: { hasNextPage: true, endCursor: '8583263101309667894' }
      const resFeed = res // Parse edges next
      return [resFeed, queryInfo.hasNextPage?queryInfo.endCursor:'']
    })
    .catch(err => {
      console.log(`Qfeed: ${types[type]} POST Failed:`, `${err.message}\n${new Date().getTime()}`)
    })

  return [feed, endCursor]
}

exports.query = query
