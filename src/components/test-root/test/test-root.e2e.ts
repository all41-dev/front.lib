import { newE2EPage } from '@stencil/core/testing';

describe('test-root', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<test-root></test-root>');

    const element = await page.find('test-root');
    expect(element).toHaveClass('hydrated');
  });
});
