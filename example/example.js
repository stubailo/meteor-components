if (Meteor.isClient) {
  Component.define(Template.hello, {
    created: function () {
      this.state.set("counter", 0);
    },
    helpers: {
      counter: function () {
        return this.state.get("counter");
      }
    },
    events: {
      'click button': function () {
        // increment the counter when button is clicked
        this.state.set("counter", this.state.get("counter") + 1);
      }
    }
  });
}