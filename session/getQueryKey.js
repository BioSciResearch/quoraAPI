/*
  Finds file containing "queryKey" and downloads it in chunks until till found.
  it is then returned as "hash".
*/

const axios = require('axios')
const zlib = require('zlib')
const { resolve } = require('path')


async function parseWebpack(webpackURL, pattern) {
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
  .catch((err) => {
    console.error('getQueryKey Error: ', err.message)
  })
}


async function webpackHash(url, webpackPattern){
  // Extracts a hash from html-source to get correct webpack file
  return await axios.get(url).then( res => {
    var hash = res.data.match(RegExp(webpackPattern))[1]
    console.log(hash)
    return hash
  }).catch((err) => {
    console.error('webpackHash Error: ', err.message)
  });
}


const qParams = (name) => {
  return {
    tribe: {
      url: `https://www.quora.com/q/${name}?sort=recent`,
      webpackURL: (s) => `-4-ans_frontend-relay-component-Multifeed-27-${s}.webpack`,
      pattern: /name:"MultifeedQuery",id:"(.*?)",/
    },

    user: {
      url: `https://www.quora.com/profile/${name}`,
      webpackURL: (s) => `-4-ans_frontend-relay-component-UserProfileTab-combined-27-${s}.webpack`,
      pattern: /name:"UserProfileCombinedListQuery",id:"(.*?)",/
    }
  }
}


async function getQueryKey(type, name) {
  /* Hash key is used to validate query searches */
  var { url, pattern, webpackURL} = qParams(name)[type]
  // Finds file containing a key to validate query
  const wpHash = await webpackHash(url, webpackURL('(.*?)'))
  // Extracts key from file's data stream
  const hash = await parseWebpack('https://qsbr.fs.quoracdn.net/' + webpackURL(wpHash), pattern)
  return hash
}

exports.getQueryKey = getQueryKey
