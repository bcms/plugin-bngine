const bcmsTWConfig = require('@becomes/cms-ui/tw');

bcmsTWConfig.content = [
  './public/index.html',
  './src/ui/**/*.{vue,js,ts,jsx,tsx}', 
  './node_modules/@becomes/cms-ui/components/**/*.{vue,js,ts,jsx,tsx}',
];
bcmsTWConfig.purge.content = [
  './public/**/*.html',
  './src/ui/**/*.{vue,js,ts,jsx,tsx}',
  './node_modules/@becomes/cms-ui/components/**/*.{vue,js,ts,jsx,tsx}',
];
module.exports = bcmsTWConfig; 