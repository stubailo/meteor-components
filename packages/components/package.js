Package.describe({
  name: 'mdg:components',
  summary: 'Beta for implementation for components',
  version: '1.0.0-pre.3'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('components.js');
  api.use(["tracker", "underscore", "ddp", "reactive-var", "htmljs"]);
  api.export("Component");
});