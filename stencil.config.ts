import { Config } from '@stencil/core';
import tailwind, { tailwindHMR, setPluginConfigurationDefaults  } from 'stencil-tailwind-plugin';
import { sass } from '@stencil/sass';

setPluginConfigurationDefaults({
  enableDebug: false,
  tailwindCssPath: './src/styles/tailwind.css',
});


export const config: Config = {
  namespace: 'front-lib',
  plugins: [
     sass(),
    tailwind(),
    tailwindHMR(),
  ],
   devServer: {
    reloadStrategy: 'pageReload'
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: "shell",
  },
};
