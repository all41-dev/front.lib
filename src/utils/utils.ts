import { CellComponent, RowComponent } from "tabulator-tables";
import Swal from 'sweetalert2';
import { Env } from "@stencil/core";

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
    return ctValue != initialValue;
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

export function checkResponseStatus(response: Response) {
  if (response.status === 403) {
    Swal.fire({
      position: 'top-end',
      toast: true,
      icon: 'error',
      title: 'Forbidden',
      text: 'Access forbidden to the resource.',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    return [];
  }
  if (response.status === 401) {
    Swal.fire({
      position: 'top-end',
      toast: true,
      icon: 'warning',
      title: 'Unauthorized',
      text: 'Access not authorized to the resource.',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    const provider = document.cookie.split(';')
      .map(cookie => cookie.trim().split('='))
      .find(([name]) => name === 'provider')?.[1];
    window.open(
      provider ? `${Env.authUrl}/${provider}` : `${Env.rootPath}login`,
      'authWindow',
      'width=600,height=400'
    );
    window.opener?.postMessage({ type: 'auth-popup' }, '*');
    return [];
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}