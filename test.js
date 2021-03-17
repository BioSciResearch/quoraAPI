const { getSession } = require('./session/getSession');
const { tribeQuery } = require('./api/tribeQuery');
const { parseFeed } = require('./oldapi/parse/parseFeed');


const content = {
  tribeID: 1584598,
  name: 'quoraspacesupdates',
  url: 'https://www.quora.com/q/quoraspacesupdates',
  images: {
    icon:'https://qph.fs.quoracdn.net/main-thumb-ti-1584598-100-rzmcwzxgcmfioltgwwmgiyidoeouowds.jpeg'
  }
};


const test = async () => {
  // Loop with call back to get every 12 hours after start-up
  var session = await getSession()
  setInterval(async () => {
    session = await getSession()
  }, 12*60*60*1000)

  var [feed, endCursor] = await tribeQuery(content, session)
  console.log(feed)

  if (feed) {
    var parsed = parseFeed(feed, content) //question ?'question' : false
    //parsed = question ? parsed: parsed.filter(x => !(x.type==='question'))
    console.log(parsed)
  }

}

test()

