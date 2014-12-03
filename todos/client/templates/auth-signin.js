Component.define(Template.signin, {
  created: function() {
    this.state.set("errors", {});
  },

  helpers: {
    errorMessages: function() {
      return _.values(this.state.get("errors"));
    },
    errorClass: function(key) {
      return this.state.get("errors")[key] && 'error';
    }
  },

  events: {
    'submit': function(event) {
      var self = this;

      event.preventDefault();
      
      var email = self.$('[name=email]').val();
      var password = self.$('[name=password]').val();
      
      var errors = {};

      if (! email) {
        errors.email = 'Email is required';
      }

      if (! password) {
        errors.password = 'Password is required';
      }
      
      self.state.set("errors", errors);
      if (_.keys(errors).length) {
        return;
      }
      
      Meteor.loginWithPassword(email, password, function(error) {
        if (error) {
          return self.state.set("errors", {'none': error.reason});
        }
        
        Router.go('home');
      });
    }
  }
});