import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  globalStyle: 'src/global/app.css',
  namespace: 'front-lib',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      baseUrl: 'http://localhost:8000',
      prerenderConfig: './prerender.config.ts',
    },
  ],
  env: {
    apiUrl: 'https://jsonplaceholder.typicode.com/',
  },
  plugins: [
    nodePolyfills()
  ],
};
