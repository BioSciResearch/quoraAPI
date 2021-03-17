const axios = require('axios')

async function MultifeedQuery(content, session, feedAfter=false, question=false, depth=0) {
  const headers = {
    "quora-window-id": session.windowId,
    "quora-formkey": session.formKey,
    "cookie": session.cookie,
    "quora-revision": session.revision,
  }
  const data = {
    queryName:"MultifeedQuery",
    extensions: {
      hash: session.tribeQueryKey
    },
    variables: {
      first: 8, // max around 12-ish?
      multifeedNumBundlesOnClient: depth*8,
      pageData: content.tribeID,
      multifeedPage: question? 40 : 27,

      showLiveBanner: false // idk, necessary for some reason
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
    .then(res => res.data.data.multifeedObject)
    .then(res => {
      console.log(res)
      const queryInfo = res.multifeedConnection.pageInfo // pageInfo: { hasNextPage: true, endCursor: '8583263101309667894' }
      const resFeed = res.multifeedConnection // Parse edges next
      return [resFeed, queryInfo.hasNextPage?queryInfo.endCursor:'']
    })
    .catch(err => {
      console.log('Qfeed-tribe GET Failed:', `${err.message}\n${new Date().getTime()}`)
    })

  return [feed, endCursor]
}

exports.tribeQuery = MultifeedQuery

/* const session = {
  cookie: 'm-b=R2bt35JYWyhAA3CItcnRsg==;',
  formKey: 'e5f6fe855e427e90b20a022f30c68222',
  windowId: 'react_wrlsqgdmnxmdtgpn',
  revision: '0ecd0a20119652ffb18595fb893d2f91cbca2098',
  tribeQueryKey: 'e22046587ff2a4a13b9819f049c86f091772c336df24138553feff916ba6f3f5',
  userQueryKey: '36c9966ed8929a13a7f204b3f19dc8006a4409588ced950dfb69bda81fb7766e'
}

const content = { tribeID: 1584598 }

const test = async () => {
  console.log(await MultifeedQuery(content, session))
}
test() */