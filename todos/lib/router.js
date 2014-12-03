Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody'
});

Router.map(function() {
  this.route('join');
  this.route('signin');

  this.route('listsShow', {
    path: '/lists/:_id',
    data: function () {
      return {_id: this.params._id};
    }
  });

  this.route('home', {
    path: '/',
    action: function() {
      Router.go('listsShow', Lists.findOne());
    }
  });
});
