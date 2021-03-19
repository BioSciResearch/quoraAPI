/*
  Requests a quora page to be assigned header data
  (A tribe page is used, but could prob be anything)
*/

const axios = require('axios');


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

exports.getHeader = getHeader
