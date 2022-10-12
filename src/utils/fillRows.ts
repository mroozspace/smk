type RowData = [
  godziny: string,
  liczbaGodzin: string,
  liczbaMinut: string,
  dataRozpoczecia: string,
  nazwaKomorkiOrganizacyjnej: string
]

const fillRows = (rowsData: RowData[]) => {
  const insertValue = (node: HTMLElement, value: string) => {
    node.focus()
    document.execCommand('insertText', false, value)
  }

  const fillRow = (row: HTMLElement, [
    godziny = "10h 5min",
    liczbaGodzin = "10",
    liczbaMinut = "5",
    dataRozpoczecia = "2022-04-21",
    nazwaKomorkiOrganizacyjnej = "TEST---TEST"
  ]) => {
    // todo fix select
    // const select_godziny = row.querySelector('select')
    const [
      input_liczba_godzin,
      input_liczba_minut,
      input_data_rozpoczecia,
      input_nazwa_komorki_organizacyjnej
    ] = row.querySelectorAll('input')
    // select_godziny && insertValue(select_godziny, godziny)
    // liczba godzin
    insertValue(input_liczba_godzin, liczbaGodzin)
    // liczba liczba minut
    insertValue(input_liczba_minut, liczbaMinut)
    // dzień
    insertValue(input_data_rozpoczecia, dataRozpoczecia)
    // nazwa komórki organizacyjnej
    insertValue(input_nazwa_komorki_organizacyjnej, nazwaKomorkiOrganizacyjnej)
  }

  const addButton: HTMLElement | null = document.querySelector("#inner_content_right > div > div > div > div.C5.NCC > fieldset > table > tbody > tr:nth-child(2) > td > div > div.NCC > div > table > tbody > tr > td > div > div > div > fieldset > table > tbody > tr:nth-child(7) > td > div > div > table > tbody > tr > td > div > div > fieldset > table > tbody > tr:nth-child(3) > td > div > button")
  const dataTable: HTMLElement | null = document.querySelector(`#inner_content_right > div > div > div > div.C5.NCC > fieldset > table > tbody > tr:nth-child(2) > td > div > div.NCC > div > table > tbody > tr > td > div > div > div > fieldset > table > tbody > tr:nth-child(7) > td > div > div > table > tbody > tr > td > div > div > fieldset > table > tbody > tr:nth-child(3) > td > div > div > div > table > tbody:nth-child(3)`)

  if (!addButton) {
    throw Error('nie znaleziono przycisku dodaj')
  }
  if (!dataTable) {
    throw Error('nie znaleziono tabeli z danymi')
  }

  for (let i = 0; i < rowsData.length; i++) {
    addButton.click()
  }

  for (let i = 0; i < rowsData.length; i++) {
    console.log(`inserting ${i}`, rowsData[i])
    // const newRow = dataTable.childNodes[dataTable.childElementCount - (i + 1)]
    const newRow = dataTable.querySelectorAll('tr')[dataTable.childElementCount - (i + 1)]

    fillRow(newRow, rowsData[i])
  }
}

export default fillRows