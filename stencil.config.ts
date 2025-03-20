import { Config } from '@stencil/core';

export const config: Config = {
  globalStyle: 'src/global/app.css',
  namespace: 'spider-front-lib',
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
    apiUrl: 'http://localhost:8000/api',
  }
};
