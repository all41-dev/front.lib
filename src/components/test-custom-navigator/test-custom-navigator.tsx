import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'test-custom-navigator',
  styleUrl: 'test-custom-navigator.css',
  shadow: false,
})
export class TestCustomNavigator {
  render() {
    const tabCustomTabulator = (
      <div class="container-fluid m-3">
        <test-custom-tabulator />
      </div>
    );
    const tabMarkdown = (
      <div class="container-fluid m-3">
        <test-markdown />
      </div>
    );

    return (
      <Host>
        <custom-navigator
          navElements={[
            { labelHtml: 'Custom Tabulator', contentHtml: tabCustomTabulator, linkString: 'custom' },
            { labelHtml: 'Markdown Preview', contentHtml: tabMarkdown, linkString: 'markdown' },
          ]}
          defaultTab={0}
          label={'Custom Navigator'}
        ></custom-navigator>
      </Host>
    );
  }
}
