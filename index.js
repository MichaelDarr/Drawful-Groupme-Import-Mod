require('dotenv').config()

const axios           = require('axios')
    , punycode        = require('punycode')
    , unicode         = require('unicode/category/So')
    , fs              = require('fs')
    , {promisify}     = require('util')
    , writeFileAsync  = promisify(fs.writeFile)

async function main() {

  var prompts = await getAllMessages()

  var drawfulEncodedObject = drawfulEncode(prompts)

  writePromptsToFile(drawfulEncodedObject)
}

async function getAllMessages() {

  console.log('Beginning message scrape')

  var finalPromptArr    = []
    , before_id         = null
    , unparsedMessages  = await makeMessageRequest()

  process.stdout.write('Messages scraped: 0');

  do {

    parseMessages(unparsedMessages, finalPromptArr)

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('Messages scraped: ' + finalPromptArr.length);

    before_id = unparsedMessages[unparsedMessages.length - 1].id

    unparsedMessages  = await makeMessageRequest(before_id)

  } while(unparsedMessages)

  console.log('\nMessage scrape complete\n')

  return finalPromptArr
}

async function makeMessageRequest(before_id) {

  var requestURL            = 'https://api.groupme.com/v3/groups/' + process.env.GROUPME_GROUP_ID + '/messages'
    , requestAuth           = '?token=' + process.env.GROUPME_TOKEN
    , requestMessageCount   = '&limit=100'
    , requestMessageSelect  = (before_id) ? '&before_id=' + before_id : ''

  try {
    const response = await axios.get(requestURL + requestAuth + requestMessageCount + requestMessageSelect)
    return response.data.response.messages
  } catch(error) {
    if(error.response.status !== 304) {
      console.log('import failed - groupme responded with a ' + error.response.status + ' error code')
      process.exit()
    }
    return null
  }

}

function parseMessages(unparsedMessages, finalPromptArr) {

  for(var i = 0; i < unparsedMessages.length - 1; i++) {
    if(finalPromptArr.indexOf(unparsedMessages[i].text) > -1) continue

    finalPromptArr.push(unparsedMessages[i].text)
  }
}

function drawfulEncode(prompts) {
  var drawfulEncodedObject =
    { episodeid : 1209
    , items     : []
    }

  for(var i = 0; i < prompts.length; i++) {
    drawfulEncodedObject.items.push(
      { id    : 10000 + i
      , text  : prompts[i]
      }
    )
  }

  return drawfulEncodedObject
}

async function writePromptsToFile(drawfulEncodedObject) {

  console.log('Writing new prompts to Drawful data file')

  try {
    await writeFileAsync(process.env.DRAWFUL_UNPACKED_ARCHIVE_PATH + '/games/Drawful/content/prompts.jet', JSON.stringify(drawfulEncodedObject, null, 0), 'utf-8')
    console.log('Completed file writing process')
  } catch {
    console.log('file write failed. Make sure you have an extracted copy of assets.bin in the "assets" folder')
    process.exit()
  }
}

console.log('\x1b[35m', '\n\nGroupme Drawful Mod v1, by Michael Darr.\n')
console.log('\x1b[0m')
main()
