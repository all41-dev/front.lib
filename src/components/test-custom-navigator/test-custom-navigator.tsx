import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'test-custom-navigator',
  styleUrl: 'test-custom-navigator.css',
  shadow: false,
})
export class TestCustomNavigator {
  render() {
    const tabContainerModule = (
      <module-list readOnly={false} id="module-list" componentTitle="module list" name="test-module-list" rowDefault={{ serverCode: 'main', isEnabled: true }}></module-list>
    );
    const tabContainerExchange = <exchange-list name="test-exchange-list" read-only="false"></exchange-list>;
    const foo = <div>Hello foo</div>;
    const bar = <div>Hello bar</div>;
    const foobar = <div>Hello foobar</div>;
    const foobars = <div>Hello foobars</div>;

    return (
      <Host>
        <custom-navigator
          navElements={[
            { labelHtml: 'exchange', contentHtml: tabContainerExchange, linkString: 'exchange' },
            { labelHtml: 'module', contentHtml: tabContainerModule, linkString: 'module' },
            { labelHtml: 'foo', contentHtml: foo, linkString: 'foo' },
            { labelHtml: 'bar', contentHtml: bar, linkString: 'bar' },
            { labelHtml: 'foobar', contentHtml: foobar, linkString: 'foobar' },
            { labelHtml: 'foobars', contentHtml: foobars, linkString: 'foobars' },
          ]}
          defaultTab={0}
          label={'PPSA'}
        ></custom-navigator>
      </Host>
    );
  }
}
