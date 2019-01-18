require('dotenv').config()

const axios = require('axios')

// main function
async function getMessages() {

  var finalPromptArr    = []
    , before_id         = null
    , unparsedMessages  = await makeMessageRequest()

  do {

    finalPromptArr = parseMessages(unparsedMessages, finalPromptArr)
    console.log('Messages scraped: ' + finalPromptArr.length)

    before_id = unparsedMessages[unparsedMessages.length - 1].id

    unparsedMessages  = await makeMessageRequest(before_id)

  } while(unparsedMessages)

  console.log('Success! Here are your ' + finalPromptArr.length + ' prompts:')
  console.log(finalPromptArr)
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

  for(var i = 0; i < unparsedMessages.length; i++) {
    if(finalPromptArr.indexOf(unparsedMessages[i].text) > -1) continue

    finalPromptArr.push(unparsedMessages[i].text)
  }

  return finalPromptArr
}

console.log('Groupme Drawful Mod v1. By Michael Darr./n/n')
console.log('Beginning message scrape...')
getMessages()
