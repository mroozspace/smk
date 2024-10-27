import { MessageEventType } from '../constants';
import { XlsxDutyRowData } from '../types';
import { Logger } from './logger';
import { processXlsxFile, sendDataToContent } from './xlsxUtils';

const logger = new Logger('popup');

const mapDutyRow = (row: (string | number)[]): XlsxDutyRowData => [
  String(row[0] || ''), // liczbaGodzin
  String(row[1] || ''), // liczbaMinut
  new Date(row[2] || ''), // dataRozpoczecia
  String(row[3] || ''), // nazwaKomorkiOrganizacyjnej
];

export const processDutyFile = async (
  file: File
): Promise<XlsxDutyRowData[]> => {
  return processXlsxFile<XlsxDutyRowData>(file, mapDutyRow);
};

export const sendDutyDataToContent = (xlsxValues: XlsxDutyRowData[]) => {
  sendDataToContent(xlsxValues, MessageEventType.INSERT_DUTY_DATA, logger);
};
