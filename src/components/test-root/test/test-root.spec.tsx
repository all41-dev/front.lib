import { newSpecPage } from '@stencil/core/testing';
import { TestRoot } from '../test-root';

describe('test-root', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TestRoot],
      html: `<test-root></test-root>`,
    });
    expect(page.root).toEqualHtml(`
      <test-root>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </test-root>
    `);
  });
});
