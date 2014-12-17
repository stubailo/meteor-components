Package.describe({
  name: 'bozhao:components',
  //name: 'mdg:components',
  summary: 'Beta for implementation for components, based on mdg:components',
  version: '1.0.0-pre.4'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('components.js');
  api.use(["tracker", "underscore", "ddp", "reactive-var", "htmljs"]);
  api.export("Component");
});
