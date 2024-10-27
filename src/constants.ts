import { XlsxDutyRowData, XlsxProcedureRowData } from './types';

export const PRE_DEFINED_SHIFT_TIMES = [
  '10h 5min',
  '12h 0min',
  '16h 25min',
  '24h 0min',
  'Inne',
];

export enum MessageEventType {
  INSERT_DUTY_DATA = 'INSERT_DUTY_DATA',
  INSERT_PROCEDURE_DATA = 'INSERT_PROCEDURE_DATA',
}

export type MessageEvent =
  | {
      type: MessageEventType.INSERT_DUTY_DATA;
      payload: {
        xlsxValues: XlsxDutyRowData[];
      };
    }
  | {
      type: MessageEventType.INSERT_PROCEDURE_DATA;
      payload: {
        xlsxValues: XlsxProcedureRowData[];
      };
    };
