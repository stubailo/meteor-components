var CONNECTION_ISSUE_TIMEOUT = 5000;

Component.define(Template.appBody, {
  created: function () {
    var self = this;

    self.state.set("menuOpen", false);
    self.state.set("userMenuOpen", false);
    self.state.set("showConnectionIssue", false);

    // Only show the connection error box if it has been 5 seconds since
    // the app started
    setTimeout(function () {
      // Show the connection error box
      self.state.set("showConnectionIssue", true);
    }, CONNECTION_ISSUE_TIMEOUT);

    self.subscribe('publicLists');
    self.subscribe('privateLists');
  },
  rendered: function() {
    // set up a swipe left / right handler
    this.$("#container").touchwipe({
      wipeLeft: function () {
        this.state.set("menuOpen", false);
      },
      wipeRight: function () {
        this.state.set("menuOpen", true);
      },
      preventDefaultEvents: false
    });

    this.find('#content-container')._uihooks = {
      insertElement: function(node, next) {
        $(node)
          .hide()
          .insertBefore(next)
          .fadeIn();
      },
      removeElement: function(node) {
        $(node).fadeOut(function() {
          $(this).remove();
        });
      }
    };
  },
  helpers: {
    // We use #each on an array of one item so that the "list" template is
    // removed and a new copy is added when changing lists, which is
    // important for animation purposes. #each looks at the _id property of it's
    // items to know when to insert a new item and when to update an old one.
    thisArray: function() {
      return [{_id: this.args.get("_id")}];
    },
    menuOpen: function() {
      return this.state.get("menuOpen") && 'menu-open';
    },
    cordova: function() {
      return Meteor.isCordova && 'cordova';
    },
    emailLocalPart: function() {
      var email = Meteor.user().emails[0].address;
      return email.substring(0, email.indexOf('@'));
    },
    userMenuOpen: function() {
      return this.state.get("userMenuOpen");
    },
    lists: function() {
      return Lists.find();
    },
    activeListClass: function() {
      var current = Router.current();
      if (current.route.name === 'listsShow' && current.params._id === this._id) {
        return 'active';
      }
    },
    connected: function() {
      if (this.state.get("showConnectionIssue")) {
        return Meteor.status().connected;
      } else {
        return true;
      }
    },
    loading: function () {
      return ! this.ready();
    }
  },
  events: {
    'click .js-menu': function() {
      this.state.set("menuOpen", ! this.state.get("menuOpen"));
    },

    'click .content-overlay': function(event) {
      this.state.set("menuOpen", false);
      event.preventDefault();
    },

    'click .js-user-menu': function(event) {
      this.state.set("userMenuOpen", ! this.state.get("userMenuOpen"));
      // stop the menu from closing
      event.stopImmediatePropagation();
    },

    'click #menu a': function() {
      this.state.set("menuOpen", false);
    },

    'click .js-logout': function() {
      Meteor.logout();
      
      // if we are on a private list, we'll need to go to a public one
      var current = Router.current();
      if (current.route.name === 'listsShow' && current.data().userId) {
        Router.go('listsShow', Lists.findOne({userId: {$exists: false}}));
      }
    },

    'click .js-new-list': function() {
      var list = {name: Lists.defaultName(), incompleteCount: 0};
      list._id = Lists.insert(list);

      Router.go('listsShow', list);
    }
  }
});