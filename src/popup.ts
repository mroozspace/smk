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
  const xlsxLabel: HTMLLabelElement | null =
    document.querySelector('#xlsxInput-label');
  const fileNameDisplay = document.querySelector('#xlsx-fileName');

  const updateFileName = (fileName: string) => {
    const captionNode = document.createElement('p');
    captionNode.classList.add('text', 'caption');
    captionNode.innerText = fileName;

    const currentCaption = fileNameDisplay?.firstChild;
    currentCaption
      ? currentCaption.replaceWith(captionNode)
      : fileNameDisplay?.appendChild(captionNode);

    xlsxLabel?.classList.add('has-file');
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      alert('Proszę wybrać plik w formacie .xlsx');
      return;
    }

    const fileSize = file.size / 1024 / 1024; // in MiB
    if (fileSize > 10) {
      alert('Plik jest zbyt duży');
      return;
    }

    // Update the input's files
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (xlsxInput) {
      xlsxInput.files = dataTransfer.files;
    }

    updateFileName(file.name);
  };

  // Handle file input change
  xlsxInput?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      handleFile(file);
    }
  });

  // Handle drag and drop
  if (xlsxLabel) {
    xlsxLabel.ondragover = (e: DragEvent) => {
      e.preventDefault();
      xlsxLabel.classList.add('dragover');
    };

    xlsxLabel.ondragleave = () => {
      xlsxLabel.classList.remove('dragover');
    };

    xlsxLabel.ondrop = (e: DragEvent) => {
      e.preventDefault();
      xlsxLabel.classList.remove('dragover');

      const file = e.dataTransfer?.files[0];
      if (file) {
        handleFile(file);
      }
    };
  }

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
