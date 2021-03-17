/* 
  This function generates a minimal header to get a response from multiFeedQuery.
  This header can be used for any tribe/space.
*/

const axios = require('axios');
const { getQueryKey } = require('./getQueryKey');

async function getSession(space='quoraspacesupdates') {
  const session = await axios
    .get(`https://www.quora.com/q/${space}?sort=recent`)
    .then(async (res) => {
      // Extracts the tribeHash(space-ID) from a webpack file name.
      const tribeHash = res.data.match(/Multifeed-\d\d-(.*?).webpack/)[1]
      // Finds file containing a key to validate query
      var webpackURL = `https://qsbr.fs.quoracdn.net/-4-ans_frontend-relay-component-Multifeed-27-${tribeHash}.webpack`
      // Extracts key
      const QueryKey = await getQueryKey(webpackURL)
      // Minimal api header to get post response. (update every ~12hr)
      return {
        cookie: 'm-b='+res.data.match(/\\"browserId\\":\\"(.*?)\\",/)[1]+";",
        formKey: res.data.match(/"formkey":"(.*?)",/)[1],
        windowId: res.data.match(/"windowId": "(.*?)",/)[1],
        revision: res.data.match(/"revision": "(.*?)",/)[1],
        queryKey: QueryKey,
        unix: new Date()
      }
    })
    .catch((error) => {
      console.error(error)
    })
  console.log('Session:', session)
  return session
}

exports.getSession = getSession
