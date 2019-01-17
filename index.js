require('dotenv').config()

const axios = require('axios')

getMessages()

async function getMessages() {
  var unparsedMessages = await makeMessageRequest(null)
}

async function makeMessageRequest(before_id) {

  var requestURL            = 'https://api.groupme.com/v3/groups/' + process.env.GROUPME_GROUP_ID + '/messages'
    , requestAuth           = '?token=' + process.env.GROUPME_TOKEN
    , requestMessageSelect  = (before_id) ? '&before_id=' + before_id : ''

  return axios(
    { method  : 'GET'
    , url     : requestURL + requestAuth + requestMessageSelect
    }
  )
}
