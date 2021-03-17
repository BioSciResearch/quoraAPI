const axios = require('axios');
const { parseFeed } = require('./parse/parseFeed.js');

async function MultifeedQuery(content, session, lastQuery, feedAfter=false, question=false, depth=0) {
  const headers = {
    "quora-window-id": session.windowId,
    "quora-formkey": session.formKey,
    "cookie": session.cookie,
    "quora-revision": session.revision,
  }
  const data = {
    queryName:"MultifeedQuery",
    extensions: {
      hash: session.queryKey
    },
    variables: {
      first: 8, // max around 12-ish?
      multifeedNumBundlesOnClient: depth*8,
      pageData: content.tribeID,
      multifeedPage: question? 40 : 27
      /*
      multifeedPage: (aka feedType)
        mainPage:
          • top = 37
          • recent = 27
        questions:
          • recent  = 40
          • unanswered questions = 27
      */
    }
  }

  if (feedAfter) {
    data["variables"]["multifeedAfter"] = feedAfter
  }

  var [feed, endCursor]  = await axios.post(
    "https://www.quora.com/graphql/gql_para_POST?q=MultifeedQuery", 
    data, { headers: headers }
    )
    .then(res => {
      const queryInfo = res.data.data.multifeedObject.multifeedConnection.pageInfo // pageInfo: { hasNextPage: true, endCursor: '8583263101309667894' }
      const resFeed = res.data.data.multifeedObject.multifeedConnection // Parse edges next
      return [resFeed, queryInfo.hasNextPage?queryInfo.endCursor:'']
    })
    .catch(err => {
      console.log('Qfeed GET Failed:', `${err.message}\n${new Date().getTime()}`)
    })
  if (feed) {
    var parsed = parseFeed(feed, content) //question ?'question' : false
    parsed = question ? parsed: parsed.filter(x => !(x.type==='question'))
    return [parsed, endCursor]
  }
}

async function getFeed(content, session, lastQuery, feedAfter=false, question=false, depth=0) {
  var filterNew
  var [parsed, endCursor] = await MultifeedQuery(...arguments)

  filterNew = parsed.filter(obj => {
    //obj.unix===0&&console.log(obj.type)
    const isNew = obj.unix > lastQuery.getTime()
    //isNew ? console.log(isNew):{}
    return isNew
  })
  if (filterNew.length < parsed.length) { //or call depth reached
    return filterNew
  } else {
    console.log('next get:', depth+1 )
    return await getFeed(content, session, lastQuery, feedAfter=endCursor, question=false, depth=depth+1).then(
      res => [...filterNew, ...res]
    )
  }
}


exports.getFeed = getFeed


/***  Testing ***/

/* 
//See urls of posts
newSession().then(session => {
  const channelHash = "ac94929fc24a430b02506fea903ee3017024cce1357918caf6dd1d3d7dbb1ed7"
  getFeed(channelHash, session, (feed) => {
    console.log(
      feed.multifeedConnection.edges.map(edge => edge.node.stories).flat() // list of posts
      .map(story=> story[['share','question','post'].filter(  // identify type and use as key to get contents
          type => Object.keys(story).includes(type) 
        )[0]].url // get url from content 
      )
    )
  })
}) */


/* 
//See first
newSession().then(session => {
  const channelHash = "ac94929fc24a430b02506fea903ee3017024cce1357918caf6dd1d3d7dbb1ed7"
  getFeed(channelHash, session, (feed) => {
    console.log(
      JSON.stringify(feed.multifeedConnection.edges.map(edge => edge.node.stories).flat() // list of posts
      .map(story=> story[['share','question','post'].filter(  // identify type and use as key to get contents
          type => Object.keys(story).includes(type) 
        )[0]] // get url from content 
      )[0])
      //[0] isTribeItemPinned: true
    )
  })
})
*/

/* 
//stringify all
newSession().then(session => {
  const channelHash = "ac94929fc24a430b02506fea903ee3017024cce1357918caf6dd1d3d7dbb1ed7"
  getFeed(channelHash, session, (feed) => {
    console.log(
      JSON.stringify(feed.multifeedConnection.edges.map(edge => edge.node.stories).flat())
    )
  })
})
 */

/*
// Template
newSession().then(session => {
  const channelHash = "ac94929fc24a430b02506fea903ee3017024cce1357918caf6dd1d3d7dbb1ed7"
  getFeed(channelHash, session, (feed) => {
    console.log(
      //your code here
    )
})
*/

//newSession()