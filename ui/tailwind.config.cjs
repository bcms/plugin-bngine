const bcmsTWConfig = require('@becomes/cms-ui/tailwind.config.cjs');

bcmsTWConfig.content = [
  './public/index.html',
  './index.html',
  './src/**/*.{vue,js,ts,jsx,tsx}',
  './node_modules/@becomes/cms-ui/components/**/*.{vue,js,ts,jsx,tsx}',
];
bcmsTWConfig.purge.content = [
  './public/**/*.html',
  './index.html',
  './src/**/*.{vue,js,ts,jsx,tsx}',
  './node_modules/@becomes/cms-ui/components/**/*.{vue,js,ts,jsx,tsx}',
];
module.exports = bcmsTWConfig;
