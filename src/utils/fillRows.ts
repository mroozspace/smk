import { PRE_DEFINED_SHIFT_TIMES } from "../constants"
import { XlsxRowData } from "../types"
import { formatDate } from "./formatDate"

/** API available since Chrome v103 */
type CheckVisibility = {
  checkVisibility?: Function
}
type WithCheckVisibility<T> = T & CheckVisibility

const insertValue = (node: HTMLElement, value: string) => {
  node.focus()
  document.execCommand('insertText', false, value)
}

const fillRow = (row: HTMLElement, [
  liczbaGodzin = "10",
  liczbaMinut = "5",
  dataRozpoczecia = new Date("2022-04-21"),
  nazwaKomorkiOrganizacyjnej = "nazwa_komorki_organizacyjnej"
]) => {
  if (row.querySelectorAll('input').length === 0) {
    throw new Error("Nie znaleziono inputow");
  }

  const select_godziny = row.querySelector('select')
  const [
    input_liczba_godzin,
    input_liczba_minut,
    input_data_rozpoczecia,
    input_nazwa_komorki_organizacyjnej
  ] = row.querySelectorAll('input')

  const formattedDate = formatDate(dataRozpoczecia) // bez tego przesunięcie o 1 dzień do tyłu...

  // dzień
  insertValue(input_data_rozpoczecia, formattedDate)
  // nazwa komórki organizacyjnej
  insertValue(input_nazwa_komorki_organizacyjnej, nazwaKomorkiOrganizacyjnej)
  // liczba godzin
  insertValue(input_liczba_godzin, liczbaGodzin)
  // liczba liczba minut
  insertValue(input_liczba_minut, liczbaMinut)

  if (PRE_DEFINED_SHIFT_TIMES.includes(`${liczbaGodzin}h ${liczbaMinut}min`) && select_godziny) {
    // wybierz liczbę godzin
    select_godziny.value = `${liczbaGodzin}h ${liczbaMinut}min`
    select_godziny.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

const fillRows = async (rowsData: XlsxRowData[]) => {
  const addButton = [...document.querySelectorAll('button')]
    .filter((el: WithCheckVisibility<HTMLButtonElement>) => el?.checkVisibility?.() && el.innerText === 'Dodaj')[0]
  // Może działać tylko dla przycisku dodaj obok pierwszego roku document.querySelector("#inner_content_right > div > div > div > div.C5.NCC > fieldset > table > tbody > tr:nth-child(2) > td > div > div.NCC > div > table > tbody > tr > td > div > div > div > fieldset > table > tbody > tr:nth-child(7) > td > div > div > table > tbody > tr > td > div > div > fieldset > table > tbody > tr:nth-child(3) > td > div > button")
  const dataTable = addButton.parentElement?.querySelector('table')
  //document.querySelector(`#inner_content_right > div > div > div > div.C5.NCC > fieldset > table > tbody > tr:nth-child(2) > td > div > div.NCC > div > table > tbody > tr > td > div > div > div > fieldset > table > tbody > tr:nth-child(7) > td > div > div > table > tbody > tr > td > div > div > fieldset > table > tbody > tr:nth-child(3) > td > div > div > div > table > tbody:nth-child(3)`)

  if (!addButton) {
    throw Error('nie znaleziono przycisku dodaj')
  }
  if (!dataTable) {
    throw Error('nie znaleziono tabeli z danymi')
  }

  const addRows = async () => {
    for (let i = 0; i < rowsData.length; i++) {
      addButton.click()
      if (i % 20 === 0) { // potrzebny throttle, na kazde klikniecie idzie request
        await new Promise((res, rej) => setTimeout(() => res(true), 100))
      }
    }
  }

  const insertDataToRows = async () => {
    for (let i = 0; i < rowsData.length; i++) {
      const tableRows = dataTable.querySelectorAll('tr')
      // console.log(`inserting ${i}`, rowsData[i])
      const newRow = tableRows[tableRows.length - (i + 2)]

      fillRow(newRow, rowsData[i])
    }
  }

  addRows().then(insertDataToRows)
}

export default fillRows
