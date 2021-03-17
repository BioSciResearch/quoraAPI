/* Parse post source code */
const {parseMatchObj} = require('./utils/parseMatchObj')
const {parseQContentObj, qContentText, qContentImg, getName, parseTime} = require('./utils/parseQContent')

exports.getAnswer = (fullURL, res) =>{
  var answerObj = res.data.match(/(\"{\\"data\\":{\\"tribeItem\\":(.*?)}\");/)[1].post
  var parseObjKey = {
    data: {
      post: {
        creationTime: ['content', 'unix',  parseTime],
        question: {
          title: ['content', 'title', parseQContentObj, qContentText],
        },
        content: [
          parseQContentObj, // applied to subsequent values
          ['content', 'text', (v)=>qContentText(v, 250)],
          ['content', 'image', qContentImg]
        ],
        author: {
          names: ['user', 'name', getName],
          profileImageUrl: ['user', 'pic']
        }
      }
    }
  }
  var parsedObj = parseMatchObj(answerObj, parseObjKey)
  parsedObj.content.url = fullURL
  parsedObj.type = 'answer'
  return parsedObj
}
