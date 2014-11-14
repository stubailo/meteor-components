Package.describe({
  name: 'simple:components',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('components.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('components');
  api.addFiles('components-tests.js');
});
