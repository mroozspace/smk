import { MessageEventType } from '../constants';
import { XlsxProcedureRowData } from '../types';
import { Logger } from './logger';
import { processXlsxFile, sendDataToContent } from './xlsxUtils';

const logger = new Logger('popup');

const mapProcedureRow = (row: (string | number)[]): XlsxProcedureRowData => [
  new Date(row[0] || ''), // data
  String(row[1] || ''), // rok
  String(row[2] || ''), // kod zabiegu
  String(row[3] || ''), // osoba wykonująca
  String(row[4] || ''), // miejsce wykonania
  String(row[5] || ''), // nazwa stażu
  String(row[6] || ''), // inicjały pacjenta
  String(row[7] || ''), // płeć pacjenta
  String(row[8] || ''), // dane osoby wykonującej I i II asystę
  String(row[9] || ''), // procedura z grupy
];

export const processProcedureFile = async (
  file: File
): Promise<XlsxProcedureRowData[]> => {
  return processXlsxFile<XlsxProcedureRowData>(file, mapProcedureRow);
};

export const sendProcedureDataToContent = (
  xlsxValues: XlsxProcedureRowData[]
) => {
  sendDataToContent(xlsxValues, MessageEventType.INSERT_PROCEDURE_DATA, logger);
};
