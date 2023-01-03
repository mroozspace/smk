'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log('[background:request.type]', request.type, request.payload);
  if (request.type === 'GREETINGS') {
    const message: string = `Hi ${sender.tab ? 'Con' : 'Pop'
      }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Send a response message
    sendResponse({
      message,
    });
  }
});
