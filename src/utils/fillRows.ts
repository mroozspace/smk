import { PRE_DEFINED_SHIFT_TIMES } from '../constants';
import { XlsxDutyRowData, XlsxProcedureRowData } from '../types';
import { formatDate } from './formatDate';
import { Logger } from './logger';

const logger = new Logger('utils');

/** API available since Chrome v103 */
type CheckVisibility = {
  checkVisibility?: Function;
};
type WithCheckVisibility<T> = T & CheckVisibility;

const insertValue = (node: HTMLElement, value: string) => {
  node.focus();
  document.execCommand('insertText', false, value);
};

const getAddBtn = () =>
  [...document.querySelectorAll('button')].filter(
    (el: WithCheckVisibility<HTMLButtonElement>) =>
      el?.checkVisibility?.() && el.innerText === 'Dodaj'
  )[0];

const addRows = async (addButton: HTMLButtonElement, rowsDataCount: number) => {
  const BTN_CLICKS_PAUSE_TRESHOLD = 10;
  for (let i = 0; i < rowsDataCount; i++) {
    addButton.click();
    if (i % BTN_CLICKS_PAUSE_TRESHOLD === 0) {
      // potrzebny throttle, na kazde klikniecie idzie request
      await new Promise((res, rej) => setTimeout(() => res(true), 100));
    }
  }
};

type RowType = 'duty' | 'procedure';
type RowFiller<T> = {
  type: RowType;
  fill: (row: HTMLElement, data: T) => void;
};

const fillRows = async <T>(
  rowsData: T[],
  rowFiller: RowFiller<T>,
  getTableRows: () => HTMLElement[]
) => {
  const addButton = getAddBtn();
  logger.info(`running fillRows for ${rowFiller.type}`, rowsData);

  if (!addButton) {
    throw Error('nie znaleziono przycisku dodaj');
  }

  const insertDataToRows = async () => {
    logger.info(`inserting data to ${rowFiller.type} rows`);
    const tableRows = getTableRows();
    for (let i = 0; i < rowsData.length; i++) {
      let newRow;
      if (rowFiller.type === 'procedure') newRow = tableRows[i];
      if (rowFiller.type === 'duty')
        newRow = tableRows[tableRows.length - (i + 2)];

      if (!newRow) {
        throw Error(`nie znaleziono wiersza ${i} dla typu ${rowFiller.type}`);
      }
      rowFiller.fill(newRow, rowsData[i]);
    }
  };

  await addRows(addButton, rowsData.length);
  await insertDataToRows();
};

const fillDutyRow: RowFiller<XlsxDutyRowData> = {
  type: 'duty',
  fill: (
    row,
    [
      liczbaGodzin = '10',
      liczbaMinut = '5',
      dataRozpoczecia = new Date('2022-04-21'),
      nazwaKomorkiOrganizacyjnej = 'nazwa_komorki_organizacyjnej',
    ]
  ) => {
    if (row.querySelectorAll('input').length === 0) {
      throw new Error('Nie znaleziono inputow');
    }

    const select_godziny = row.querySelector('select');
    const [
      input_liczba_godzin,
      input_liczba_minut,
      input_data_rozpoczecia,
      input_nazwa_komorki_organizacyjnej,
    ] = row.querySelectorAll('input');

    const formattedDate = formatDate(dataRozpoczecia);

    insertValue(input_data_rozpoczecia, formattedDate);
    insertValue(input_nazwa_komorki_organizacyjnej, nazwaKomorkiOrganizacyjnej);
    insertValue(input_liczba_godzin, liczbaGodzin);
    insertValue(input_liczba_minut, liczbaMinut);

    if (
      PRE_DEFINED_SHIFT_TIMES.includes(`${liczbaGodzin}h ${liczbaMinut}min`) &&
      select_godziny
    ) {
      select_godziny.value = `${liczbaGodzin}h ${liczbaMinut}min`;
      select_godziny.dispatchEvent(new Event('change', { bubbles: true }));
    }
  },
};

const fillProcedureRow: RowFiller<XlsxProcedureRowData> = {
  type: 'procedure',
  fill: (
    row,
    [
      data = new Date(),
      rok = '1',
      kodZabiegu = 'A - operator',
      osobaWykonujaca = 'Imię i nazwisko',
      miejsceWykonania = 'Oddział Chirurgii Onkologicznej Chorób Piersi - Wielkopolskie Centrum Onkologii im. M. Skłodowskiej-Curie',
      nazwaStazu = 'Staż kierunkowy w zakresie chirurgii ogólnej',
      inicjalyPacjenta = 'XX',
      plecPacjenta = 'M',
      daneAsystenta = '',
      proceduraGrupa = '',
    ]
  ) => {
    if (row.querySelectorAll('input').length === 0) {
      throw new Error('Nie znaleziono inputow');
    }

    const inputs = row.querySelectorAll('input');
    const selects = row.querySelectorAll('select');
    const formattedDate = formatDate(data);

    const inputValues = [
      formattedDate,
      osobaWykonujaca,
      inicjalyPacjenta,
      daneAsystenta,
      proceduraGrupa,
    ];

    const selectsValues = [
      rok,
      kodZabiegu,
      miejsceWykonania,
      nazwaStazu,
      plecPacjenta,
    ];

    inputs.forEach((input, index) => {
      if (inputValues[index]) {
        insertValue(input as HTMLElement, inputValues[index]);
      }
    });

    selects.forEach((select, index) => {
      select.value = selectsValues[index];
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
  },
};

const fillDutyRows = async (rowsData: XlsxDutyRowData[]) => {
  const getDutyTableRows = () => {
    const addButton = getAddBtn();
    const dataTable = addButton?.parentElement?.querySelector('table');
    if (!dataTable) {
      throw Error('nie znaleziono tabeli z danymi');
    }
    return Array.from(dataTable.querySelectorAll('tr'));
  };

  await fillRows(rowsData, fillDutyRow, getDutyTableRows);
};

const fillProcedureRows = async (rowsData: XlsxProcedureRowData[]) => {
  const getProcedureTableRows = () => {
    const FIELDS_IN_PROCEDURE_ROW = 14;
    return Array.from(document.querySelectorAll('tr')).filter(
      (row) => row.querySelectorAll('td').length === FIELDS_IN_PROCEDURE_ROW
    ) as HTMLElement[];
  };

  await fillRows(rowsData, fillProcedureRow, getProcedureTableRows);
};

export { fillDutyRows, fillProcedureRows };
