'use strict';

import { MessageEventType, MessageEvent } from './constants';
import { fillDutyRows, fillProcedureRows } from './utils/fillRows';
import { Logger } from './utils/logger';

const logger = new Logger('contentScript');

// Log when content script is loaded
logger.info('Content script loaded');

function checkPageContent(): boolean {
  const pageText = document.body.innerText.toLowerCase();
  return pageText.includes('dyżur');
}

// Listen for message
chrome.runtime.onMessage.addListener(
  (request: MessageEvent, sender, sendResponse) => {
    logger.info('Message received in content script:', request);

    if (request.type === MessageEventType.CHECK_PAGE_CONTENT) {
      const hasDutyContent = checkPageContent();
      sendResponse({
        type: MessageEventType.PAGE_CONTENT_RESPONSE,
        payload: { hasDutyContent },
      });
    }

    if (request.type === MessageEventType.INSERT_DUTY_DATA) {
      const { xlsxValues } = request.payload;
      fillDutyRows(xlsxValues);
    }

    if (request.type === MessageEventType.INSERT_PROCEDURE_DATA) {
      const { xlsxValues } = request.payload;
      fillProcedureRows(xlsxValues);
    }

    // Send an empty response for other message types
    // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
    if (!sendResponse.arguments) {
      sendResponse({});
    }
    return true;
  }
);
