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
  CHECK_PAGE_CONTENT = 'CHECK_PAGE_CONTENT',
  PAGE_CONTENT_RESPONSE = 'PAGE_CONTENT_RESPONSE',
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
    }
  | {
      type: MessageEventType.CHECK_PAGE_CONTENT;
    }
  | {
      type: MessageEventType.PAGE_CONTENT_RESPONSE;
      payload: {
        hasDutyContent: boolean;
      };
    };
