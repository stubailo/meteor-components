Component.define(Template.join, {
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

      // XXX convert to event.target.email, etc
      var email = this.$('[name=email]').val();
      var password = this.$('[name=password]').val();
      var confirm = this.$('[name=confirm]').val();

      var errors = {};

      if (! email) {
        errors.email = 'Email required';
      }

      if (! password) {
        errors.password = 'Password required';
      }

      if (confirm !== password) {
        errors.confirm = 'Please confirm your password';
      }

      this.state.set("errors", errors);
      if (_.keys(errors).length) {
        return;
      }

      Accounts.createUser({
        email: email,
        password: password
      }, function(error) {
        if (error) {
          return this.state.set("errors", {'none': error.reason});
        }

        Router.go('home');
      });
    }
  }
});