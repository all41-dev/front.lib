
import { Component, Host, h } from '@stencil/core';
import { TabulatorFull } from 'tabulator-tables';
import { CustomTabulatorColumn } from '../../interfaces/custom-tabulator.types';

@Component({
  tag: 'test-custom-tabulator',
  styleUrl: 'test-custom-tabulator.css',
  shadow: false,
})
export class TestCustomTabulator {

  tabulatorComponent: TabulatorFull;

  render() {
    const columns: CustomTabulatorColumn[] = [
      { title: 'Name', field: 'foo', editable: true, editor: 'input', headerFilter: 'input', maxWidth: 150, validator: ["minLength:5", 'required'] as any },
      { title: 'Comment2', field: 'comment', editable: true, editor: 'textarea', headerFilter: 'input', width: 250, },
      { title: 'c3', field: 'c3', editable: true, editor: 'textarea', headerFilter: 'input', width: 800, visible: false },
      { title: 'number', field: 'c4', editable: true, editor: 'number', headerFilter: 'input', width: 800, visible: false },
      { title: 'c5', field: 'c5', editable: true, editor: 'textarea', headerFilter: 'input', width: 800, visible: false },
      {
        title: 'list', field: 'list', editable: true, editor: 'list' as any,
        editorParams: {
          values: { 1: 'a', 2: 'b', 3: 'c' },
          autocomplete: true,
          itemFormatter: (label: string, _value, _item, _element) => `${label}-${_value}`,
        } as any,
        headerFilter: 'input', width: 800, visible: true, required: true,
        formatter: (cell) =>
          (cell.getColumn().getDefinition().editorParams as any).values[cell.getValue()]
      },
    ];
    const data = [
      {
        foo: 'barxxx', uuid: '123-456', comment: 'this is a comment', c3: 'I am a c3 value', c4: 12, _children: [
          { foo: 'real', uuid: '1c4cd45f-9bd7-4aad-8923-a64529fd4dc8', c4: 'a' },
          { foo: 'dd', uuid: 'werhwerh' }]
      },
      { foo: 'raz', uuid: '4284687236' }];
    return (
      <Host>

        <custom-tabulator id="foo" name='test-foo'
          componentTitle='component title'
          readOnly={false} route='modules'
          treeConfig={{ parentField: 'parentUuid', childField: 'childs' }}
          editionMode={'side'} height={500}
          data={data}
          columns={columns}
        ></custom-tabulator>
        {/* <custom-tabulator name='test2' readOnly={false} route='modules' isTree={true} isModal={false} height={250}
          data={JSON.parse(JSON.stringify(data))}
          columns={JSON.parse(JSON.stringify(columns))}// need a copy as first sanple would impact second and vice-versa
        ></custom-tabulator> */}
        {/* <button onClick={() => {
          const comp: HTMLCustomTabulatorElement = document.querySelector('#foo');
          console.debug(comp.tabulatorComponent.getColumns());
              }}>access component from outside</button> */}
      </Host>
    );
  }

}
