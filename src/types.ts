/**
 * Reprezentuje wiersz danych dyżuru z pliku XLSX
 * @typedef {[string, string, Date, string]} XlsxDutyRowData
 */
export type XlsxDutyRowData = [
  /** Liczba godzin dyżuru (np. "10") */
  liczbaGodzin: string,
  /** Liczba minut dyżuru (np. "5") */
  liczbaMinut: string,
  /** Data rozpoczęcia dyżuru */
  dataRozpoczecia: Date,
  /** Nazwa komórki organizacyjnej, w której odbył się dyżur */
  nazwaKomorkiOrganizacyjnej: string
];

/**
 * Reprezentuje wiersz danych procedury medycznej z pliku XLSX
 * @typedef {[Date, string, string, string, string, string, string, string, string, string]} XlsxProcedureRowData
 */
export type XlsxProcedureRowData = [
  /** Data wykonania procedury */
  data: Date,
  /** Rok wykonania procedury (np. "2023") */
  rok: string,
  /** Kod zabiegu identyfikujący rodzaj procedury medycznej */
  kodZabiegu: string,
  /** Imię i nazwisko osoby wykonującej zabieg */
  osobaWykonujaca: string,
  /** Miejsce wykonania zabiegu */
  miejsceWykonania: string,
  /** Nazwa stażu, podczas którego wykonano zabieg */
  nazwaStazu: string,
  /** Inicjały pacjenta zachowujące prywatność */
  inicjalyPacjenta: string,
  /** Płeć pacjenta (np. "K" dla kobiety, "M" dla mężczyzny) */
  plecPacjenta: string,
  /** Dane asystenta jeśli dotyczy */
  daneAsystenta: string,
  /** Grupa do której należy procedura */
  proceduraGrupa: string
];
