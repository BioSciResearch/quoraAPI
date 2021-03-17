const axios = require('axios')

function defaultReturn(fullURL, res) {
  return {url:fullURL, data:res}
}

// Takes callback, but defaults to await/then use
module.exports.getQuora = async (url, callback=defaultReturn) => {
  return await axios.get(url)
    .then(res => {
      const fullURL = res.request.connection._httpMessage.res.responseUrl
      return callback(fullURL, res)
    })
    .catch(err =>{
      console.log('Quora GET Failed:', `${err.message}\n${url}\n${new Date().getTime()}`)
    })
}

/* 
//Callback + then 
getQuora(url, quoraRouter).then(res => {
  console.log(res)
  console.log(embed[res.type+'Embed'](res))
})

//then only
getQuora(url).then(res => {
  const obj = quoraRouter(res.url, res.data)
  console.log(embed[obj.type+'Embed'](obj))
}) 
*/
