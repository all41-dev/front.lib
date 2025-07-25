import { Component, Host, h, State } from '@stencil/core';
import { CellComponent } from 'tabulator-tables';
import { CustomTabulatorColumn } from '../../interfaces/custom-tabulator.types';

@Component({
  tag: 'test-custom-tabulator',
  styleUrl: 'test-custom-tabulator.css',
  shadow: false,
})
export class TestCustomTabulator {
  @State() showApi = false;

  clearStatusClasses(rowElement) {
    rowElement.classList.remove('ok-row', 'warning-row', 'error-row', 'offline-row');
  }

  formatStatusCell(cell: CellComponent): string {
    if (!cell.getRow().getData()?.uuid) return '';
    const status = cell.getValue() as 'OK' | 'WARN' | 'ERROR' | undefined;
    this.clearStatusClasses(cell.getRow().getElement());

    if (status === 'OK') return `<i class="bi bi-check-circle-fill text-success"></i>`;
    if (status === 'WARN') return `<i class="bi bi-exclamation-triangle-fill text-warning"></i>`;
    if (status === 'ERROR') return `<i class="bi bi-x-circle-fill text-danger"></i>`;
    return `<i class="bi bi-question text-secondary"></i>`;
  }

  render() {
    const apiColumns: CustomTabulatorColumn[] = [
      { title: 'ID', field: 'id', editable: false },
      { title: 'Name', field: 'name', modalFieldGroup: 'Display Information', editor: 'input', editable: true },
      { title: 'Username', field: 'username', modalFieldGroup: 'Display Information', editor: 'input', editable: true },
      { title: 'Email', field: 'email', modalFieldGroup: 'Basic Information', editor: 'input', editable: true },
      { title: 'Phone', field: 'phone', modalFieldGroup: 'Basic Information', editor: 'input', editable: true },
      { title: 'Website', field: 'website', modalFieldGroup: 'Basic Information', editor: 'input', editable: true },
    ];

    const staticColumns: CustomTabulatorColumn[] = [
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
      {
        title: 'Comment',
        field: 'comment',
        editable: true,
        editor: 'textarea',
        modalFieldGroup: 'Tabulator Modal 1',
        headerFilter: 'input',
        width: 250,
      },
      {
        title: 'state',
        field: 'state',
        editable: false,
        headerFilter: 'input',
        width: 100,
        formatter: this.formatStatusCell.bind(this),
      },
      {
        title: 'number',
        field: 'c4',
        editable: true,
        editor: 'number',
        modalFieldGroup: 'Tabulator Modal 1',
        headerFilter: 'input',
        width: 800,
        visible: false,
      },
      {
        title: 'list',
        field: 'list',
        editable: true,
        editor: 'list' as any,
        modalFieldGroup: 'Tabulator Modal 1',
        editorParams: {
          values: { 1: 'a', 2: 'b', 3: 'c' },
          autocomplete: true,
          itemFormatter: (label: string, _value) => `${label}-${_value}`,
        } as any,
        headerFilter: 'input',
        width: 800,
        visible: true,
        required: true,
        formatter: cell => (cell.getColumn().getDefinition().editorParams as any).values[cell.getValue()],
      },
    ];

    const staticData = [
      {
        foo: 'barxxx',
        uuid: '123-456',
        comment: 'this is a comment',
        state: 'WARN',
        c4: 12,
        childs: [
          {
            foo: 'real',
            uuid: '1c4cd45f-9bd7-4aad-8923-a64529fd4dc8',
            state: 'ERROR',
            comment: 'this is a comment',
          },
          { foo: 'dd', uuid: 'werhwerh', state: 'OK' },
        ],
      },
      { foo: 'raz', uuid: '4284687236' },
    ];

    return (
      <Host>
        <div class="form-check form-switch mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="tabulatorModeSwitch"
            checked={this.showApi}
            onInput={e => (this.showApi = (e.target as HTMLInputElement).checked)}
          />
          <label class="form-check-label" htmlFor="tabulatorModeSwitch">
            {this.showApi ? 'API Mode (JSONPlaceholder)' : 'Static Data Mode'}
          </label>
        </div>

        {this.showApi ? (
          <custom-tabulator
            key="api-mode"
            id="api-tabulator"
            name="api-mode"
            componentTitle="Users from JSONPlaceholder"
            readOnly={false}
            route="users"
            idPropName="id"
            editionMode="side"
            height="500"
            columns={apiColumns}
          ></custom-tabulator>
        ) : (
          <custom-tabulator
            key="static-mode"
            id="static-tabulator"
            name="static-mode"
            componentTitle="Static Tabulator"
            readOnly={false}
            route=""
            editionMode="side"
            height="500"
            data={staticData}
            columns={staticColumns}
            treeConfig={{ parentField: 'parentUuid', childField: 'childs' }}
          ></custom-tabulator>
        )}
      </Host>
    );
  }
}
