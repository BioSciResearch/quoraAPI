/* Helper functions for parsing scraped Quora content */
const { unescapeJSON } = require("../utils/unescapeJson")

function parseQContentObj(strObj) {
  if(strObj.constructor === String) {
    return unescapeJSON(strObj).sections.map(el=>el.spans).flat()
  } else {
    return ''
  }
}

module.exports = {
  /* Patterns */
  quoraPattern: /https?:\/\/(www\.)?[(quora.com)||(qr.ae)]{1,256}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm,

  /* Url Helpers */
  stripIdentifiers(url) {
    return url.split(/[&?]/)[0]
  },

  sanitizeLink(url) {
    return url[0]==='/'?'https://www.quora.com'+url:url
  },

  /* content Helpers */
  parseTime(numOrStr) {
    const len = (Math.log10(+numOrStr)|0)
    const diff = len-12
    return Math.round(+numOrStr / 10**(diff))
  }, 

  getName(qNameObj) {
    if(qNameObj.constructor === Array){
      var latin = qNameObj.filter(name => name.scriptCode==="LATN")
      qNameObj = latin ? latin : qNameObj
      return `${qNameObj[0].givenName} ${qNameObj[0].familyName}`
    } else {
      return ''
    }
  },

  qContentImg(arr) {
    arr = parseQContentObj(arr)
    if(arr) {
      const imgObj = arr.filter(obj=>obj.modifiers.image)[0]
      return imgObj ? imgObj.modifiers.image : false
    } else {
      return ''
    }
  },

  qContentText(arr, trim = false) {
    arr = trim ? arr : parseQContentObj(arr)
    if(arr) {
      const text = arr.map(obj=>obj.text).flat().join('')
      return trim ? text.substring(0, trim) + '...' : text
    } else {
      return ''
    }
  },

  getExr(v) {
    return v.constructor===Object?'':v
  },

  parseQContentObj
}
