const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#8B6AA2',
              '@menu-bg': '#ffffff',
              '@layout-body-background': '#ffffff',
              '@layout-footer-background': '#FDBA3C',
              '@layout-header-background': '#ffffff',
              '@layout-trigger-color': '#002140',
              '@layout-zero-trigger-height': '64px',
              '@layout-zero-trigger-width': '70px',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
