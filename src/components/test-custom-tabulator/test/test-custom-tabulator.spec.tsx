import { newSpecPage } from '@stencil/core/testing';
import { TestCustomTabulator } from '../test-custom-tabulator';

describe('test-custom-tabulator', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TestCustomTabulator],
      html: `<test-custom-tabulator></test-custom-tabulator>`,
    });
    expect(page.root).toEqualHtml(`
      <test-custom-tabulator>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </test-custom-tabulator>
    `);
  });
});
