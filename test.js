const { getSession } = require('./session/getSession');
const { tribeQuery } = require('./api/tribeQuery');
const { parseFeed } = require('./api/parseFeed');


const content = {
  tribeID: 1584598,
  name: 'quoraspacesupdates',
  url: 'https://www.quora.com/q/quoraspacesupdates',
  images: {
    icon:'https://qph.fs.quoracdn.net/main-thumb-ti-1584598-100-rzmcwzxgcmfioltgwwmgiyidoeouowds.jpeg'
  }
};

// Loop with call back to get every 12 hours after start-up
const initSession = async (callback, args=[]) => {
  var session = await getSession()
  setInterval(async () => {
    session = await getSession()
  }, 12*60*60*1000)
  await callback(session, ...args)
}

const test = async (session, content) => {
  var [feed, endCursor] = await tribeQuery(session, content.tribeID)
  //console.log(feed)

  if (feed) {
    var parsed = parseFeed(feed, content) //question ?'question' : false
    //parsed = question ? parsed: parsed.filter(x => !(x.type==='question'))
    console.log(parsed)
  }
}
initSession(test, [content])



const seekNew = async (session, content, lastQuery, options={depth:0}) => {
  console.log('enter')
  var [parsed, endCursor] = await tribeQuery(session, content.tribeID)
    .then(([feed, endCursor]) => {
      var parsed = parseFeed(feed, content)
      return [parsed, endCursor]
    })

  var filterNew = parsed.filter(obj => {
    const isNew = obj.unix > lastQuery  // .getTime()
    return isNew
  })

  if (!(filterNew.length < parsed.length)) {  // if none get filtered for being old
    console.log('next get:', options.depth+1 )
    options = {...options, feedAfter: endCursor, depth: options.depth+1}
    filterNew = await seekNew(session, content, lastQuery, options).then(
      res => [...filterNew, ...res]
    )
  }

  console.log(filterNew)
  return filterNew
}
//initSession(seekNew, [content, 1610000000000])


/* 
const {getQuora} = require('./api/getQuora')
const {quoraRouter} = require('./api/quoraRouter')
var url = "https://www.quora.com/q/quoraspacesupdates"
getQuora(url, quoraRouter).then(res => {
  console.log(res)
})
*/