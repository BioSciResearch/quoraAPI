const axios = require('axios')
const {query} = require('../utils/queryHelper')

async function tribeQuery(session, tribeID, options = {feedAfter: false, question: false, depth: 0} ) {
  const data = {
    queryName:"MultifeedQuery",
    extensions: {
      hash: session.tribeQueryKey
    },
    variables: {
      first: 8, // max around 12-ish?
      multifeedNumBundlesOnClient: options.depth*8,
      pageData: tribeID,
      multifeedPage: options.question? 40 : 27,
  
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
  
  if (options.feedAfter) {
    data["variables"]["multifeedAfter"] = options.feedAfter
  }

  return query(session, data)  // [feed, endCursor]
}

exports.tribeQuery = tribeQuery

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
  console.log(await tribeQuery(session, content.tribeID))
}
test() */
