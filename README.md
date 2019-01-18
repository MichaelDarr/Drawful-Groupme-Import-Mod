# Drawful Groupme Import Mod

## Turn the entire contents of a group chat into a prompt set for Drawful 1

### Prerequisites

1. [Node.js](https://nodejs.org/en/download/)
2. [A Groupme Account/Chat](https://groupme.com/)
2. [QuickBMS](https://aluigi.altervista.org/quickbms.htm)
3. [The Jackbox Party Pack](https://store.steampowered.com/app/331670/The_Jackbox_Party_Pack/)

### Installation/Use (as of 01/18/2019)

1. Clone this github repo
2. Navigate to your local copy of this project in the command line and run `npm install`
3. Rename `SAMPLE.env` to `.env` and open it in a text editor. Keep this open until step 8.
4. [Go to the groupme dev panel](https://dev.groupme.com/) and click on "Access Token" in the upper right hand corner. Replace `groupme-access-token-here` in your new `.env` file with the bolded sequence of letters and numbers it gives you.
5. You now need your group id. In your browser, copy this into the url bar:

   `https://api.groupme.com/v3/groups?token=`

   Then, at the end (after `?token=`), paste in your access token from step 4. Press enter and you should see a whole bunch of data. Look through it to find a block of data with:

   `"name": "the group you want to make drawful prompts out of"`

   Just preceding this line will be a `group_id`. Copy this number, go back to your `.env` file, and replace `groupme-group-id-here` with the group id.


6. Locate the install directory of Jackbox Party Pack:
   1. Find the game in your steam library
   2. Right click it
   3. Select `properties`
   4. Select the `local files` tab
   5. Click on `browse local files`
   6. Click on the address bar of your the file explorer that just popped up and copy this address.

   Go back to your `.env` file. After `DRAWFUL_ASSET_BIN_PATH=`, there is a file path similar to what you just copied. Replace that with your file path.

7. Run `quickbms.exe` wherever you extracted it from.
    1. In the window that pops up, navigate to the directory where you cloned this repo and select the `extractJBPP.bms` file. Confirm with `Open`.
    2. After you select that, another window pops up. Now, navigate to the Jackbox Party Pack file location we found in step 6 and select the assets.bin file. Confirm with `Open`.
    3. Another window will pop up (this is the last one, I promise!). Now, navigate to a new empty directory and confirm with `Save`.
    4. Go to the empty directory you just selected. Now, there should be a file called `assets.bin` there. This is a modified version of the original that exactly mirrors a zip file. As such, rename it `assets.zip`. Windows will warn you it might become unusable - ignore this and go full steam ahead.
    5. Extract this zip to **an empty directory**. Go to this directory and make sure that it has three subfolders (games, music, and sfx) as well as a few other .swf files and a .txt file. Copy the location of this directory.
    
   Go back to your `.env` file. After `DRAWFUL_UNPACKED_ARCHIVE_PATH=`, replace `C:\drawful-assets` with the path you copied in step 7.v. We're finally done here - save and close the `.env` file.

8. Now that we've done all the setup, we need to run the program. Go back to the command line from step 2. Make sure you are in the directory where you cloned this repo. Run the command `npm start` and you should see some progress text that ultimately culminates in a message of "Modification successful!"

9. Go back to steam and launch the Jackbox Party Pack. If everything went well, it won't crash and you will have modified your Drawful prompts to mirror your groupchat! If you ever want to update the prompts to include new messages, just navigate to the directory again and re-run `npm start`.
