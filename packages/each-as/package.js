Package.describe({
  name: 'each-as',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles(['each-as.html', 'each-as.js'], "web");
  api.use("templating");
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('each-as');
  api.addFiles('each-as-tests.js');
});
