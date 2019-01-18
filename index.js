require('dotenv').config()

const axios           = require('axios')
    , punycode        = require('punycode')
    , ProgressBar     = require('progress')
    , fs              = require('fs')
    , archiver        = require('archiver')
    , {promisify}     = require('util')
    , writeFileAsync  = promisify(fs.writeFile)

async function main() {

  console.log('\x1b[35m', '\n\nDrawful Groupme Import Mod, by Michael Darr.\n')
  console.log('\x1b[0m')

  var prompts = await getAllMessages()

  var drawfulEncodedObject = drawfulEncode(prompts)

  await writePromptsToFile(drawfulEncodedObject)

  await createPromptDataFiles(drawfulEncodedObject)

  await zipFileContents()
}

// retrieves messages from groupme via API
async function getAllMessages() {

  console.log('Beginning message scrape')

  var finalPromptArr    = []
    , before_id         = null
    , unparsedMessages  = await makeMessageRequest()

  process.stdout.write('Messages scraped: 0');

  // keep requesting the next batch of messages until you receive an empty page
  do {

    parseMessages(unparsedMessages, finalPromptArr)

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('Messages scraped: ' + finalPromptArr.length);

    before_id = unparsedMessages[unparsedMessages.length - 1].id

    unparsedMessages  = await makeMessageRequest(before_id)

  } while(unparsedMessages)

  console.log('\nScraping complete\n')

  return finalPromptArr
}

// manages API requests based on groupme's pagination system of "before_id"s
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

// takes the message objects, extracts messages, strips spaces, and checks for duplicates
function parseMessages(unparsedMessages, finalPromptArr) {

  for(var i = 0; i < unparsedMessages.length - 1; i++) {
    var promptToInsert = unparsedMessages[i].text.trim()
    if(finalPromptArr.indexOf(promptToInsert) > -1) continue

    finalPromptArr.push(promptToInsert)
  }
}

// reformats the prompt array into an object laid out like drawful's
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

// simple object to JSON in a text file (.jet is jackbox's extension for this stuff)
async function writePromptsToFile(drawfulEncodedObject) {

  console.log('Writing new prompts to Drawful data file')

  try {
    await writeFileAsync(process.env.DRAWFUL_UNPACKED_ARCHIVE_PATH + '/games/Drawful/content/prompts.jet', JSON.stringify(drawfulEncodedObject, null, 0), 'utf-8')
    console.log('Completed file writing process\n')
  } catch(error) {
    console.log(error)
    console.log('file write failed. Make sure you have an extracted copy of assets.bin in the "assets" folder')
    process.exit()
  }
}

// drawful looks for data for each prompt by id. Let's go ahead and create all that
async function createPromptDataFiles(drawfulEncodedObject) {

  console.log('Creating prompt data')

  var prompts = drawfulEncodedObject.items

  await  Promise.all(prompts.map(async prompt => {
    try {

      var fileDirectory = process.env.DRAWFUL_UNPACKED_ARCHIVE_PATH + '/games/Drawful/content/prompts/' + prompt.id

      if (!fs.existsSync(fileDirectory)){
        fs.mkdirSync(fileDirectory);
      }

      var dataToWrite =
        { fields:
          [ { v: "false"
            , t: "B"
            , n: "HasJokeAudio"
            }
          , { v: ""
            , t: "S"
            , n: "AlternateSpellings"
            }
          , { v: prompt.text
            , t: "S"
            , n: "QuestionText"
            }
          , { t: "A"
            , n: "JokeAudio"
            }
          ]
        }

      await writeFileAsync(fileDirectory + '/data.jet', JSON.stringify(dataToWrite, null, 0), 'utf-8')
    } catch {
      console.log('file write failed. Make sure you have an extracted copy of assets.bin in the "assets" folder')
      process.exit()
    }
  }))

  console.log('Completed prompt data creation\n')

}

// compress the jackbox data with your new prompts and move it to the asset directory
async function zipFileContents() {

  console.log('Compressing and injecting Drawful data')

  var bar = null

  var output  = fs.createWriteStream(process.env.DRAWFUL_ASSET_BIN_PATH + '/assets.bin')
    , archive = archiver('zip')

  output.on('close', function () {
      console.log('Compression finished');
      console.log('Files injected into Jackbox Party Pack');

      console.log('\x1b[35m', '\n\nModification successful!\n')
      console.log('\x1b[0m')
  });

  archive.on('error', function(err){
      throw err
  });

  archive.on('progress', function(data) {
    if(bar == null) {
      var bar = new ProgressBar(' compressing [:bar] :percent', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: data.fs.totalBytes
      });
    }
    bar.tick(data.fs.processedBytes);
  })

  archive.pipe(output)
  archive.directory(process.env.DRAWFUL_UNPACKED_ARCHIVE_PATH, false)
  archive.finalize()
}

main()
