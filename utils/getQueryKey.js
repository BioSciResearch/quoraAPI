/*
  Finds file containing "queryKey" and downloads it in chunks until till found.
  it is then returned as "hash".
*/

const axios = require('axios')
const zlib = require('zlib')
const { resolve } = require('path')


async function webpackHash(spaceURL){
  // Get Multifeed-webpack url
  if (spaceURL.includes("https://www.quora.com/q/")) {
    return await axios.get(spaceURL).then((res) => {
      var hash = res.data.match(/Multifeed-\d\d-(.*?).webpack/)[1]
      return hash
      console.log(hash)
    }).catch((err) => {
      console.error(err)
    });  
  }
}


/*** Generalize to webpackStealer ***/
async function getQueryKey(webpackURL) {
  // For Multifeed-webpack url, search stream content for hashKey
  return await axios.get(webpackURL, {
    responseType: 'stream', 
    transformResponse(data) {
      return data.pipe(zlib.createBrotliDecompress())
    } 
  }).then(async (res) => {
    const stream = res.data
    return new Promise((resolve, reject) => {
      // Downloads file until match is found, then ends stream and returns
      const pattern = /name:"MultifeedQuery",id:"(.*?)",/
      var chunk, match, hash;
      var last = ''
      stream.on('data', function(chunk) {
        if(!match) {
          chunk = chunk.toString('utf8')
          match = (last+chunk).match(pattern)
          if (match) { hash = match[1] }
          last = chunk
        } // on do nothing, emit close
      })
      stream.on('end', () => resolve(
        Buffer.from(hash).toString('utf8')
      ))
    })
  })
}


async function getSpaceHash(spaceURL) {
  /* Hash key is used to validate query searches */
  const wpHash = await webpackHash(spaceURL)
  var webpackURL = `https://qsbr.fs.quoracdn.net/-4-ans_frontend-relay-component-Multifeed-27-${wpHash}.webpack`
  const hash = await getQueryKey(webpackURL)
  return hash
}

//webpackHash("https://www.quora.com/q/bioscience-club/")
//const webpackURL = 'https://qsbr.fs.quoracdn.net/-4-ans_frontend-relay-component-Multifeed-27-d3085320a1564ffa.webpack';
//getSpaceHash("https://www.quora.com/q/bioscience-club/", false).then(hash=> console.log(hash))
exports.getQueryKey = getQueryKey
