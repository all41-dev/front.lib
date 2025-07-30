import { CellComponent, RowComponent } from "tabulator-tables";
import Swal from 'sweetalert2';
import { Env } from "@stencil/core";
import humanizeDuration from 'humanize-duration';
import * as bootstrap from 'bootstrap';

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

export function humanizeTimeDifference(startDate: string | number | Date, endDate?: string | number | Date): string {
  const nowUtc = endDate ? new Date(endDate).getTime() : new Date().getTime();
  const dateUtc = new Date(startDate).getTime();

  const diffInMs = nowUtc - dateUtc;

  return humanizeDuration(diffInMs, { largest: 2, round: true });
}

export function activeCellTooltip(tooltipLabel: string, cell: CellComponent) {
  const cellElement = cell.getElement();
  cellElement.setAttribute('data-bs-toggle', 'tooltip');
  cellElement.setAttribute('data-bs-placement', 'top');
  cellElement.setAttribute('title', tooltipLabel);

  let tooltip = bootstrap.Tooltip.getInstance(cellElement);
  if (!tooltip) {
    tooltip = new bootstrap.Tooltip(cellElement, {
      customClass: 'custom-tooltip',
      container: 'body',
    });
  }
}

export function initTooltips() {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    if (!bootstrap.Tooltip.getInstance(el)) {
      new bootstrap.Tooltip(el, {
        customClass: 'custom-tooltip',
        container: 'body',
      });
    }
  });
}

export function handleError(error: any) {
  if (error.status === 403) {
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
  } else if (error.status === 401) {
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
      provider ? `${Env.authUrl}/${decodeURIComponent(provider)}` : `${Env.rootPath}login`,
      'authWindow',
      'width=600,height=400'
    );
    window.opener?.postMessage({ type: 'auth-popup' }, '*');
  } else {
    Swal.fire({
      position: 'top-end',
      toast: true,
      icon: 'error',
      title: 'Error',
      text: error.message || 'An unknown error occurred.',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }
}