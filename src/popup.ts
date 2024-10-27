'use strict';

import './popup.css';
import { processDutyFile, sendDutyDataToContent } from './utils/dutyHandler';
import { Logger } from './utils/logger';
import {
  processProcedureFile,
  sendProcedureDataToContent,
} from './utils/procedureHandler';
import { ErrorHandler, withErrorHandling } from './utils/errorHandler';
import { MessageEventType, MessageEvent } from './constants';

const logger = new Logger('popup');
const errorHandler = ErrorHandler.getInstance();

class FileHandler {
  private xlsxInput: HTMLInputElement | null;
  private xlsxLabel: HTMLLabelElement | null;
  private fileNameDisplay: HTMLElement | null;
  private onFileUploaded: () => void;

  constructor(onFileUploaded: () => void) {
    this.xlsxInput = document.querySelector('#xlsxInput');
    this.xlsxLabel = document.querySelector('#xlsxInput-label');
    this.fileNameDisplay = document.querySelector('#xlsx-fileName');
    this.onFileUploaded = onFileUploaded;
    this.initialize();
  }

  private updateFileName(fileName: string) {
    const captionNode = document.createElement('p');
    captionNode.classList.add('text', 'caption');
    captionNode.innerText = fileName;

    const currentCaption = this.fileNameDisplay?.firstChild;
    currentCaption
      ? currentCaption.replaceWith(captionNode)
      : this.fileNameDisplay?.appendChild(captionNode);

    this.xlsxLabel?.classList.add('has-file');
  }

  private async validateAndProcessFile(file: File) {
    try {
      if (!file.name.endsWith('.xlsx')) {
        throw new Error('Proszę wybrać plik w formacie .xlsx');
      }

      const fileSize = file.size / 1024 / 1024; // in MiB
      if (fileSize > 10) {
        throw new Error('Plik jest zbyt duży (maksymalny rozmiar: 10MB)');
      }

      // Update the input's files
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (this.xlsxInput) {
        this.xlsxInput.files = dataTransfer.files;
      }

      this.updateFileName(file.name);
      this.onFileUploaded();
    } catch (error) {
      errorHandler.handleError(error, 'File validation');
      throw error;
    }
  }

  private initialize() {
    // Handle file input change
    this.xlsxInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (file) {
        this.validateAndProcessFile(file);
      }
    });

    // Handle drag and drop
    if (this.xlsxLabel) {
      this.xlsxLabel.ondragover = (e: DragEvent) => {
        e.preventDefault();
        this.xlsxLabel?.classList.add('dragover');
      };

      this.xlsxLabel.ondragleave = () => {
        this.xlsxLabel?.classList.remove('dragover');
      };

      this.xlsxLabel.ondrop = (e: DragEvent) => {
        e.preventDefault();
        this.xlsxLabel?.classList.remove('dragover');

        const file = e.dataTransfer?.files[0];
        if (file) {
          this.validateAndProcessFile(file);
        }
      };
    }
  }

  public getFiles(): FileList | null {
    return this.xlsxInput?.files || null;
  }
}

class App {
  private fileHandler: FileHandler;
  private putDutyValuesBtn: HTMLButtonElement | null;
  private putProcedureValuesBtn: HTMLButtonElement | null;

  constructor() {
    this.putDutyValuesBtn = document.querySelector('#putDutyValuesBtn');
    this.putProcedureValuesBtn = document.querySelector(
      '#putProcedureValuesBtn'
    );

    // Hide buttons initially
    this.hideButtons();

    this.fileHandler = new FileHandler(() => this.onFileUploaded());
    this.initialize();
  }

  private hideButtons() {
    if (this.putDutyValuesBtn) {
      this.putDutyValuesBtn.style.display = 'none';
    }
    if (this.putProcedureValuesBtn) {
      this.putProcedureValuesBtn.style.display = 'none';
    }
  }

  private handleDutyValues = withErrorHandling(async () => {
    const files = this.fileHandler.getFiles();
    if (!files?.length) {
      throw new Error('Proszę najpierw wybrać plik');
    }

    const xlsxValues = await processDutyFile(files[0]);
    logger.info('Processed XLSX values:', xlsxValues);
    await sendDutyDataToContent(xlsxValues);
  }, 'Processing duty file');

  private handleProcedureValues = withErrorHandling(async () => {
    const files = this.fileHandler.getFiles();
    if (!files?.length) {
      throw new Error('Proszę najpierw wybrać plik');
    }

    const xlsxValues = await processProcedureFile(files[0]);
    logger.info('Processed XLSX values:', xlsxValues);
    await sendProcedureDataToContent(xlsxValues);
  }, 'Processing procedure file');

  private async checkPageContent() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return;

      const message = { type: MessageEventType.CHECK_PAGE_CONTENT };
      const response = await new Promise<MessageEvent>((resolve) => {
        chrome.tabs.sendMessage(tab.id!, message, (response) => {
          resolve(response as MessageEvent);
        });
      });

      if (response?.type === MessageEventType.PAGE_CONTENT_RESPONSE) {
        const { hasDutyContent } = response.payload;

        // Show/hide buttons based on content
        if (this.putDutyValuesBtn) {
          this.putDutyValuesBtn.style.display = hasDutyContent
            ? 'inline-block'
            : 'none';
        }
        if (this.putProcedureValuesBtn) {
          this.putProcedureValuesBtn.style.display = hasDutyContent
            ? 'none'
            : 'inline-block';
        }
      }
    } catch (error) {
      logger.error('Error checking page content:', error);
    }
  }

  private onFileUploaded() {
    // Check page content and show appropriate button only after file is uploaded
    this.checkPageContent();
  }

  private initialize() {
    // Add click handlers
    this.putDutyValuesBtn?.addEventListener('click', () =>
      this.handleDutyValues()
    );
    this.putProcedureValuesBtn?.addEventListener('click', () =>
      this.handleProcedureValues()
    );
  }
}

// Initialize the app
new App();
