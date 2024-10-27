'use strict';

import { MessageEventType, MessageEvent } from './constants';
import { fillDutyRows, fillProcedureRows } from './utils/fillRows';
import { Logger } from './utils/logger';

const logger = new Logger('contentScript');

// Log when content script is loaded
logger.info('Content script loaded');

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Listen for message
chrome.runtime.onMessage.addListener(
  (request: MessageEvent, sender, sendResponse) => {
    logger.info('Message received in content script:', request);

    if (request.type === MessageEventType.INSERT_DUTY_DATA) {
      const { xlsxValues } = request.payload;
      fillDutyRows(xlsxValues);
    }

    if (request.type === MessageEventType.INSERT_PROCEDURE_DATA) {
      const { xlsxValues } = request.payload;
      fillProcedureRows(xlsxValues);
    }

    // Send an empty response
    // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
    sendResponse({});
    return true;
  }
);
