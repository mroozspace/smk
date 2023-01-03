'use strict';

import './popup.css';
import {
  read as XLSXread,
  utils as XLSXutils
} from 'xlsx'; // need to import specific features, * doesn't work ...

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  // Communicate with background file by sending a message
  const pickNonEmptyArrays = (data: (string | number)[][]) => {
    const nonEmptyArrays: unknown[] = []
    for (let index = 0; index < data.length; index++) {
      if (data[index].length === 0) break;
      nonEmptyArrays.push(data[index])
    }

    return nonEmptyArrays
  }

  const putValuesButton = document.querySelector('#putValuesButton')
  const xlsxInput: HTMLInputElement | null = document.querySelector('#xlsxInput')

  xlsxInput?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    const fileList = target?.files
    const fileName = fileList && fileList[0] && fileList[0].name
    const fileSize = fileList && fileList[0] && fileList[0].size / 1024 / 1024 // in MiB

    // if (fileList?.length == 0) {
    //   putValuesButton?.classList.add('display-none')
    // }

    if (fileSize && fileSize > 10) {
      throw new Error("Plik jest zbyt duży");
    }

    const captionNode = document.createElement('p')
    captionNode.classList.add('text', 'caption')
    captionNode.innerText = fileName || ''

    const currentCaption = document.querySelector('#xlsx-fileName')?.firstChild

    currentCaption
      ? currentCaption.replaceWith(captionNode)
      : document.querySelector('#xlsx-fileName')?.appendChild(captionNode)
  })

  putValuesButton?.addEventListener('click', async () => {
    // TODO file validation
    if (xlsxInput?.files?.length) {
      const fileData = await xlsxInput.files[0].arrayBuffer()
      const workbook = XLSXread(fileData, { cellDates: true, dateNF: 'yyyy-mm-dd' }); // keep dates as string; {cellDates: true, dateNF:"dd/mm/yy"}
      const firstWorkbookSheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSXutils.sheet_to_json(firstWorkbookSheet, { header: 1 }) // raw: false
      const [_rowHeaders, ...dataToFill] = rows

      const xlsxValues = pickNonEmptyArrays(dataToFill as (string | number)[][])
      console.log(workbook, firstWorkbookSheet, xlsxValues)

      // send data to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id!,
          {
            type: 'PUT_VALUES',
            payload: {
              xlsxValues
            },
          },
          (response) => {
            console.log('XLSX passed to contentScript file', response);
          }
        );
      });
    }
  })
})();
