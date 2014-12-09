Items = new Mongo.Collection("items");

if (Meteor.isClient) {
  Component.define(Template.listForm, {
    created: function () {
      this.state.set("realtime", false);
    },
    events: {
      "click .new-item": function () {
        Items.insert({
          number: 5,
          text: "hello"
        });
      },
      "click .toggle-realtime": function () {
        this.state.set("realtime", ! this.state.get("realtime"));
      }
    },
    helpers: {
      realtimeSetting: function () {
        return this.state.get("realtime");
      },
      items: function () {
        return Items.find();
      },
      collection: function () {
        return Items;
      }
    }
  });

  Component.define(Template.simpleForm, {
    created: function () {
      var self = this;

      self.state.set("values", {});

      self.getValue = function (path) {
        return self.state.get("values")[path] ||
          self.args.get("collection").findOne(
            self.args.get("_id"))[path];
      };

      self.autorun(function () {
        if (self.args.get("realtime")) {
          self.args.get("collection").update(self.args.get("_id"), {
            $set: self.state.get("values")
          });
        }
      });
    },
    helpers: {
      form: function () {
        return this;
      }
    },
    events: {
      "simple-change simpleInput": function (event) {
        var path = event.path;
        var value = event.value;

        var obj = {};
        obj[path] = value;

        this.state.set("values", _.extend(this.state.get("values"), obj));
      },
      "click simpleSubmit": function () {
        var self = this;

        self.args.get("collection").update(self.args.get("_id"), {
          $set: self.state.get("values")
        });
      }
    }
  });

  Component.define(Template.simpleInput, {
    helpers: {
      value: function () {
        return this.args.get("form").getValue(this.args.get("path"));
      }
    },
    events: {
      "keyup input": function (event) {
        this.trigger("simple-change", {
          path: this.args.get("path"),
          value: event.target.value
        });
      }
    }
  });

  Component.define(Template.simpleSubmit, {});
}
