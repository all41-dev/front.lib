import {  CellComponent, RowComponent } from "tabulator-tables";

// export function format(first: string, middle: string, last: string): string {
//   return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
// }
export class RowHelper {
  static isEdited = (row: RowComponent) => row.getCells().some((c) => c.isEdited());
  static isNew = (row: RowComponent, keyField: string) => !row.getData()[keyField];
  static isValid = (row: RowComponent) => !row.getCells().some((c) => c.isValid() !== true);
  static hasChilds = (row: RowComponent, newRecordsOnly: boolean = false, idField?: string) => {
    const childs = row.getTreeChildren().filter((c) => newRecordsOnly ? !c.getData()[idField] : true);
    return childs.length > 0;
  }
}

export class CellHelper {
  static isEdited = (cell: CellComponent) => {
    const ctValue = cell.getValue();
    const initialValue = cell.getRow().getData().__initialValues[cell.getField()] || cell.getInitialValue();

    // console.debug(ctValue);
    // console.debug(initialValue);
    // console.debug(ctValue == initialValue);
    return ctValue != initialValue ;
  }
}

export class HtmlHelper {
  static toElement = (innerHtml: string) => {
    const elem = document.createElement('template');
    elem.innerHTML = innerHtml;
    return elem.content.firstElementChild as HTMLElement;
  }
}

export function clearStatusClasses(rowElement) {
  rowElement.classList.remove('ok-row');
  rowElement.classList.remove('warn-row');
  rowElement.classList.remove('error-row');
  rowElement.classList.remove('offline-row');
}