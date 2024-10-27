import { read as XLSXread, utils as XLSXutils } from 'xlsx';
import { MessageEventType, MessageEvent } from '../constants';
import { XlsxDutyRowData, XlsxProcedureRowData } from '../types';
import { Logger } from './logger';

const logger = new Logger('utils');

type XlsxRowData = XlsxDutyRowData | XlsxProcedureRowData;
type RowMapper<T extends XlsxRowData> = (row: (string | number)[]) => T;

type MessageTypeToData = {
  [MessageEventType.INSERT_DUTY_DATA]: XlsxDutyRowData;
  [MessageEventType.INSERT_PROCEDURE_DATA]: XlsxProcedureRowData;
};

/**
 * Przetwarza tablicę danych, mapując niepuste wiersze na określony typ
 */
export const processNonEmptyArrays = <T extends XlsxRowData>(
  data: (string | number)[][],
  mapRow: RowMapper<T>
): T[] => {
  const nonEmptyArrays: T[] = [];
  for (let index = 0; index < data.length; index++) {
    if (data[index].length === 0) break;
    nonEmptyArrays.push(mapRow(data[index]));
  }
  return nonEmptyArrays;
};

/**
 * Przetwarza plik XLSX i zwraca przetworzone dane
 */
export const processXlsxFile = async <T extends XlsxRowData>(
  file: File,
  mapRow: RowMapper<T>
): Promise<T[]> => {
  const fileData = await file.arrayBuffer();
  const workbook = XLSXread(fileData, {
    cellDates: true,
    dateNF: 'yyyy-mm-dd',
  });
  const firstWorkbookSheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSXutils.sheet_to_json(firstWorkbookSheet, { header: 1 });
  const [_rowHeaders, ...dataToFill] = rows;

  return processNonEmptyArrays(dataToFill as (string | number)[][], mapRow);
};

/**
 * Wysyła dane do content script
 */
export const sendDataToContent = <T extends MessageEventType>(
  xlsxValues: MessageTypeToData[T][],
  messageType: T,
  logger: Logger
): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const message = {
      type: messageType,
      payload: {
        xlsxValues,
      },
    } as MessageEvent;

    chrome.tabs.sendMessage(tab.id!, message, (response) => {
      if (chrome.runtime.lastError?.message) {
        logger.error(chrome.runtime.lastError.message);
      }
      logger.info('XLSX passed to contentScript file', response);
    });
  });
};
