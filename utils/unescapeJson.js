/*
Handles various dirty json conditions.
-catches simple: already an obj/not string, it is parsable
-can parse single and multi-escaped json
-else: attempts parse or returns input
*/

function analyzeQuotes(str) {
  var includesQuotes = str.match(/^(["'])|(["'])$/g)
  var firstIsQuote = ['"',"'"].includes(str[0])
  // Sanitize string
  if (includesQuotes && !includesQuotes.length===2) {
    console.log("unescapeJSON Error: mismatched quotes. Attempting save...")
    str = firstIsQuote ? str+includesQuotes[0] : str[str.length-1]+str
    includesQuotes = [true, true]
  }
  return [includesQuotes, str]
}

function unescapeJSON(str) {
  // Simple catch
  if (str.constructor !== String) { // not string
    return str
  }
  if (str.match(/(^{"(.*?)":)/)) { // Parsable
    return JSON.parse(str)
  }

  // Input Analysis
  var singleEscape = str.match(/(^['"]?{\"(.*?):)/g)
  var multiEscape = str.match(/^(["']?{\\+\"(.*?):)/g)
  
  if (singleEscape) { // double parsable
    return JSON.parse(JSON.parse(str)) 
  } else if (multiEscape) { // requires recursion
    var [includesQuotes, strSanitized] = analyzeQuotes(str)
    var output = includesQuotes ? JSON.parse(strSanitized) : JSON.parse('"'+str+'"')
    return unescapeJSON(output)
  } else { // Uncaught
    console.log("unescapeJSON Error: Attempting parse, else return original")
    try { return JSON.parse(str) } 
    catch { return str }
  }
}

exports.unescapeJSON = unescapeJSON
