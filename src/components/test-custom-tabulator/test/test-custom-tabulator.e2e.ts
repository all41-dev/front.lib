import { newE2EPage } from '@stencil/core/testing';

describe('test-custom-tabulator', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<test-custom-tabulator></test-custom-tabulator>');

    const element = await page.find('test-custom-tabulator');
    expect(element).toHaveClass('hydrated');
  });
});
