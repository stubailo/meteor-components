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
      event.preventDefault();
      
      var email = this.$('[name=email]').val();
      var password = this.$('[name=password]').val();
      
      var errors = {};

      if (! email) {
        errors.email = 'Email is required';
      }

      if (! password) {
        errors.password = 'Password is required';
      }
      
      this.state.set("errors", errors);
      if (_.keys(errors).length) {
        return;
      }
      
      Meteor.loginWithPassword(email, password, function(error) {
        if (error) {
          return this.state.set("errors", {'none': error.reason});
        }
        
        Router.go('home');
      });
    }
  }
});