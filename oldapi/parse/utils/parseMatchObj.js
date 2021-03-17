/*   TL;DR minimizes manual oversight of sanitizing scraped JSON

This code takes Json(even stringified) as source 
and uses a parse object as a key to traverse its depths.
at terminal depths, it will assign the source value to 
the provided object key(s). 

You can read more about how this works in the README, 
under my choice to use an anti-pattern that benefits this method.
*/
const axios = require('axios')
const { unescapeJSON } = require('../../../utils/unescapeJson')

function arrToObj(obj, arr, value={}, i=0) {
  // key array convered to object depth:
  // ["foo", "bar", "baz"] => { foo: { bar: { baz: {} } } }
  const el = arr[i]
  if (!obj[el]) obj[el] = {}
  obj[el] = (i === arr.length-1)? value : arrToObj(obj[el], arr, value, i+1)
  return obj
}
//console.log(arrToObj({}, ["foo", "bar", "baz"]))


function parseArr(keyFuncArr, val) {
  // Split keys and functions
  var kArr = keyFuncArr.filter(x=> x.constructor === String)
  var fArr = keyFuncArr.filter(x=> x.constructor === Function)
  if (fArr) fArr.forEach(f=>{ val = f(val) }) // apply functions in order to given value
  return [kArr, val]
}
//console.log(parseArr(['returned', 'keys', (v)=>{return +v+1}, (v)=>{return +v+2}], 0))

function handlePreAppend(preAppend, kArr) {
  if(['~','*'].includes(kArr[0])) { // bypass append, start from root
    return kArr.slice(1)
  } else if(kArr[0].startsWith('^')) { //assign to parent (or n-grandparent if multiple in string)
    var regressCount = kArr[0].split("^").length-1
    return [...preAppend.slice(1, -1*regressCount), ...kArr]
  }
  return [...preAppend, ...kArr]
}

//const AsyncFunction = Object.getPrototypeOf(async ()=>{}).constructor
//not sure what to I think about async yet.
function parseMatchObj(source, parseObj, output = {}, inherited = [], inheritKey='_key') {
  // If string parse else proceed
  source = typeof source === "string"? unescapeJSON(source) : source
  // for given depth of object iterate keys
  var preAppend = inherited
  for (var [sourceKey, outPutKeys] of Object.entries(parseObj)) {

    if (sourceKey.startsWith(inheritKey)) {
      // all keyArrays below inheritKey in parseObj will be pre-appended with inheritKeys value
      // can set new inherit with _key1, _key2, etc. or delete current-level inherit, {_keyN:[], ...}.
      preAppend = [...inherited, ...outPutKeys]
      continue;
    }


    if (!source[sourceKey]) {
      // if key doesn't exist define as empty object 
      // to continue till assignment array is reached 
      source[sourceKey] = outPutKeys.constructor===Array? false: {} 
      //null or undef would be better, but nit essential atm
    }

    var sourceVal = source[sourceKey]
    if (outPutKeys.constructor === Object) {
      // Expected output (type Array) not reached yet, increase depth
      output = parseMatchObj(sourceVal, outPutKeys, output, preAppend, inheritKey)
    } else if (outPutKeys.constructor === Array) {

      if ([Array, Function].includes(outPutKeys[0].constructor)) { //[Array, Function, AsyncFunction].includes(outPutKeys[0].constructor)
        // Calculate multiple parseObj key values from Source
        var [sourceValF, chain] = [sourceVal, false]
        for(arr of outPutKeys) {
          if (arr.constructor === Function){  //[Function, AsyncFunction].includes(outPutKeys[0].constructor)
            // Apply function for all SUBSEQUENT values, can chain functions or start from og value with new function if broken by assignment.
            sourceValF = arr(chain?sourceValF:sourceVal)
            chain = true
          } else { 
            // set multiple parseObj keys from same source value
            var [kArr, newVal] = parseArr(handlePreAppend(preAppend, arr), sourceValF)
            output = arrToObj(output, kArr, newVal)
            chain = false
          }
        }
      } 
      
      else {
        // Calculate single parseObj key value from Source
        outPutKeys = handlePreAppend(preAppend, outPutKeys)
        var [kArr, newVal] = parseArr(outPutKeys, sourceVal)
        output = arrToObj(output, kArr, newVal)
      }

    } else {
      console.log("parse object error, expected type Object or Array")
    }
  }
  return output
}

exports.parseMatchObj = parseMatchObj