'use strict';

import fillRows from "./utils/fillRows";

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log('[contentScript:request.type]', request.type)

  if (request.type === 'PUT_VALUES') {
    const rowsData = request.payload.xlsxValues
    fillRows(rowsData)
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
