'use strict';

import './popup.css';
import { processDutyFile, sendDutyDataToContent } from './utils/dutyHandler';
import { Logger } from './utils/logger';
import {
  processProcedureFile,
  sendProcedureDataToContent,
} from './utils/procedureHandler';

const logger = new Logger('popup');

(function () {
  const putDutyValuesBtn = document.querySelector('#putDutyValuesBtn');
  const xlsxInput: HTMLInputElement | null =
    document.querySelector('#xlsxInput');

  xlsxInput?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const fileList = target?.files;
    const fileName = fileList && fileList[0] && fileList[0].name;
    const fileSize = fileList && fileList[0] && fileList[0].size / 1024 / 1024; // in MiB

    if (fileSize && fileSize > 10) {
      throw new Error('Plik jest zbyt duży');
    }

    const captionNode = document.createElement('p');
    captionNode.classList.add('text', 'caption');
    captionNode.innerText = fileName || '';

    const currentCaption = document.querySelector('#xlsx-fileName')?.firstChild;

    currentCaption
      ? currentCaption.replaceWith(captionNode)
      : document.querySelector('#xlsx-fileName')?.appendChild(captionNode);
  });

  putDutyValuesBtn?.addEventListener('click', async () => {
    if (xlsxInput?.files?.length) {
      const xlsxValues = await processDutyFile(xlsxInput.files[0]);
      logger.info('Processed XLSX values:', xlsxValues);
      sendDutyDataToContent(xlsxValues);
    }
  });

  const putProcedureValuesBtn = document.querySelector(
    '#putProcedureValuesBtn'
  );
  putProcedureValuesBtn?.addEventListener('click', async () => {
    if (xlsxInput?.files?.length) {
      const xlsxValues = await processProcedureFile(xlsxInput.files[0]);
      logger.info('Processed XLSX values:', xlsxValues);
      sendProcedureDataToContent(xlsxValues);
    }
  });
})();
