/* 
  This function generates a minimal header to get a response from multiFeedQuery.
  This header can be used for any tribe/space.
*/

const axios = require('axios');
const { getQueryKey } = require('./getQueryKey');

async function getHeader(tribe) {
  const header = await axios
    .get(`https://www.quora.com/q/${tribe}?sort=recent`)
    .then(res => {
      return {
        cookie: 'm-b='+res.data.match(/\\"browserId\\":\\"(.*?)\\",/)[1]+";",
        formKey: res.data.match(/"formkey":"(.*?)",/)[1],
        windowId: res.data.match(/"windowId": "(.*?)",/)[1],
        revision: res.data.match(/"revision": "(.*?)",/)[1]
      }
    })
    .catch((error) => {
      console.error('getQueryKey Error: ', error.message)
    })
  return header
}

async function getSession(tribe='quoraspacesupdates', user='Adam-DAngelo') {
  const tribeQueryKey = await getQueryKey('tribe', tribe)
  const userQueryKey = await getQueryKey('user', user)
  const header = await getHeader(tribe)

  // Minimal api header to get post response. (update every ~12hr)
  const session = {
    ...header,
    tribeQueryKey,
    userQueryKey,
    unix: new Date()
  }

  console.log('Session:', session)
  return session
}

exports.getSession = getSession
