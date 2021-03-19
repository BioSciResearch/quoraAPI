const axios = require('axios')

function defaultReturn(fullURL, res) {
  return { url:fullURL, data:res }
}

// Takes callback, but defaults to await/then use
module.exports.getQuora = async (url, callback=defaultReturn) => {
  return await axios.get(encodeURI(url))
    .then(res => {
      const fullURL = res.request.connection._httpMessage.res.responseUrl
      return callback(fullURL, res)
    })
    .catch(err =>{
      console.log('Quora GET Failed:', `${err.message}\n${url}\n${Date.now()}`)
      return err
    })
}

/* 
const {quoraRouter} = require('./quoraRouter')
var url = "https://www.quora.com/q/quoraspacesupdates"
module.exports.getQuora(url, quoraRouter).then(res => {
  console.log(res)
})
 */
