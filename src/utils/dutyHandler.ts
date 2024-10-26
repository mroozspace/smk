import { read as XLSXread, utils as XLSXutils } from 'xlsx';

export const pickNonEmptyArrays = (data: (string | number)[][]) => {
  const nonEmptyArrays: unknown[] = [];
  for (let index = 0; index < data.length; index++) {
    if (data[index].length === 0) break;
    nonEmptyArrays.push(data[index]);
  }
  return nonEmptyArrays;
};

export const processDutyFile = async (file: File) => {
  const fileData = await file.arrayBuffer();
  const workbook = XLSXread(fileData, {
    cellDates: true,
    dateNF: 'yyyy-mm-dd',
  });
  const firstWorkbookSheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSXutils.sheet_to_json(firstWorkbookSheet, { header: 1 });
  const [_rowHeaders, ...dataToFill] = rows;

  return pickNonEmptyArrays(dataToFill as (string | number)[][]);
};

export const sendDutyDataToContent = (xlsxValues: unknown[]) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id!,
      {
        type: 'PUT_VALUES',
        payload: {
          xlsxValues,
        },
      },
      (response) => {
        console.log('XLSX passed to contentScript file', response);
      }
    );
  });
};
