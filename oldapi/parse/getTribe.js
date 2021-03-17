/* Parse tribe source code */
const {parseMatchObj} = require('./utils/parseMatchObj')
const {parseQContentObj, qContentText, getName} = require('./utils/parseQContent')

exports.getTribe = (fullURL, res) => {
  var tribeObj = res.data.match(/(\"{\\"data\\":{\\"tribe\\":(.*?)}\");/)[1]
  //console.log(JSON.parse(JSON.parse(tribeObj)).data.tribe)
  var parseObjKey = {
    data: {
      tribe: {
        handle: ['content', 'kabob', (extension)=> extension.substring(2)],
        url: [
          ['content', 'url', (extension)=>`https://www.quora.com${extension}`],
          ['content', 'hash', (extension)=> extension.substring(3)]
        ],
        tribeId: ['content', 'tribeID'],
        name: ['content', 'name', parseQContentObj, qContentText],
        description: ['content', 'blurb', parseQContentObj, qContentText],
        //coverPhotoRetinaUrl: ['content', 'images', 'cover'],
        coverPhotoUrl: ['content', 'images', 'cover'],
        iconUrl: ['content', 'images', 'icon'],
        admins: {
          0: {
            names: ['user', 'name', getName],
            profileImageUrl: ['user', 'pic']
          }
        }
      }
    }
  }
  var parsedObj = parseMatchObj(tribeObj, parseObjKey)
  parsedObj.type='tribe'
  return parsedObj
}
