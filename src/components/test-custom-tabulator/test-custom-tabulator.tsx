import { Component, Host, h } from '@stencil/core';
import { CellComponent, TabulatorFull } from 'tabulator-tables';
import { CustomTabulatorColumn } from '../../interfaces/custom-tabulator.types';

@Component({
  tag: 'test-custom-tabulator',
  styleUrl: 'test-custom-tabulator.css',
  shadow: false,
})
export class TestCustomTabulator {
  tabulatorComponent: TabulatorFull;

  clearStatusClasses(rowElement) {
    rowElement.classList.remove('ok-row');
    rowElement.classList.remove('warning-row');
    rowElement.classList.remove('error-row');
    rowElement.classList.remove('offline-row');
  }

  formatStatusCell(cell: CellComponent): string {
    if (!cell.getRow().getData()?.uuid) {
      return '';
    }
    const status = cell.getValue() as 'OK' | 'WARN' | 'ERROR' | undefined;
    this.clearStatusClasses(cell.getRow().getElement());
    if (status === 'OK') {
      cell.getRow().getElement().classList.add('ok-row');
      return `<i class="bi bi-check-circle-fill text-success"></i>`;
    } else if (status === 'WARN') {
      cell.getRow().getElement().classList.add('warning-row');
      return `<i class="bi bi-exclamation-triangle-fill text-warning"></i>`;
    } else if (status === 'ERROR') {
      cell.getRow().getElement().classList.add('error-row');
      return `<i class="bi bi-x-circle-fill text-danger"></i>`;
    } else {
      return `<i class="bi bi-question text-secondary"></i>`;
    }
  }

  render() {
    const columns: CustomTabulatorColumn[] = [
      {
        title: 'Name',
        field: 'foo',
        editable: true,
        editor: 'input',
        modalFieldGroup: 'Tabulator Modal 1',
        headerFilter: 'input',
        maxWidth: 150,
        validator: ['minLength:5', 'required'] as any,
      },
      { title: 'Comment', field: 'comment', editable: true, editor: 'textarea', modalFieldGroup: 'Tabulator Modal 1', headerFilter: 'input', width: 250 },
      { title: 'state', field: 'state', editable: false, headerFilter: 'input', width: 100, formatter: this.formatStatusCell.bind(this) },
      { title: 'number', field: 'c4', editable: true, editor: 'number', modalFieldGroup: 'Tabulator Modal 2', headerFilter: 'input', width: 800, visible: false },
      {
        title: 'list',
        field: 'list',
        editable: true,
        editor: 'list' as any,
        modalFieldGroup: 'Tabulator Modal 2',
        editorParams: {
          values: { 1: 'a', 2: 'b', 3: 'c' },
          autocomplete: true,
          itemFormatter: (label: string, _value, _item, _element) => `${label}-${_value}`,
        } as any,
        headerFilter: 'input',
        width: 800,
        visible: true,
        required: true,
        formatter: cell => (cell.getColumn().getDefinition().editorParams as any).values[cell.getValue()],
      },
    ];
    const data = [
      {
        foo: 'barxxx',
        uuid: '123-456',
        comment: 'this is a comment',
        state: 'WARN',
        c4: 12,
        childs: [
          { foo: 'real', uuid: '1c4cd45f-9bd7-4aad-8923-a64529fd4dc8', state: 'ERROR', comment: 'this is a comment' },
          { foo: 'dd', uuid: 'werhwerh', state: 'OK' },
        ],
      },
      { foo: 'raz', uuid: '4284687236' },
    ];
    /* const testApiColumns: CustomTabulatorColumn[] = [
      { title: 'UUID', field: 'uuid', editable: false, editor: 'input', headerFilter: 'input', width: 250 },
      { title: 'Username', field: 'username', editable: true, editor: 'input', headerFilter: 'input', maxWidth: 150, validator: ['minLength:3', 'required'] as any },
      { title: 'Email', field: 'email', editable: true, editor: 'input', headerFilter: 'input', width: 250, validator: ['email', 'required'] as any },
      { title: 'First Name', field: 'firstName', editable: true, editor: 'input', headerFilter: 'input', maxWidth: 150 },
      { title: 'Last Name', field: 'lastName', editable: true, editor: 'input', headerFilter: 'input', maxWidth: 150 },
      { title: 'Auth UUID', field: 'auth_uuid', editable: false, editor: 'input', headerFilter: 'input', width: 250 },
      { title: 'Provider', field: 'provider', editable: true, editor: 'tickCross', headerFilter: 'input', width: 100 },
    ]; */
    return (
      <Host>
        <custom-tabulator
          id="foo"
          name="test-foo"
          componentTitle="component title"
          readOnly={false}
          route=""
          treeConfig={{ parentField: 'parentUuid', childField: 'childs' }}
          editionMode={'side'}
          height={'75vh'}
          //options={{ maxHeight: '20vh' }}
          data={data}
          columns={columns}
        ></custom-tabulator>
        {/* <custom-tabulator
          id="foo"
          name="test-foo"
          componentTitle="component title"
          readOnly={false}
          route="users"
          editionMode={'side'}
          height={500}
          columns={testApiColumns}
        ></custom-tabulator> */}
        {/* <button
          onClick={() => {
            const comp: HTMLCustomTabulatorElement = document.querySelector('#foo');
            console.debug(comp.tabulatorComponent.getColumns());
          }}
        >
          access component from outside
        </button> */}
      </Host>
    );
  }
}
