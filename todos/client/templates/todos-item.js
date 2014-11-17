var EDITING_KEY = 'EDITING_TODO_ID';

Component.define(Template.todosItem, {
  helpers: {
    todoItem: function () {
      return Todos.findOne(this.args.get("_id"));
    },
    checkedClass: function() {
      return this.args.get("checked") && 'checked';
    },
    editingClass: function() {
      return Session.equals(EDITING_KEY, this.args.get("_id")) && 'editing';
    }
  },
  events: {
    'change [type=checkbox]': function(event) {
      var checked = $(event.target).is(':checked');
      Todos.update(this.args.get("_id"), {$set: {checked: checked}});
      Lists.update(this.args.get("listId"), {$inc: {incompleteCount: checked ? -1 : 1}});
    },
    
    'focus input[type=text]': function() {
      Session.set(EDITING_KEY, this.args.get("_id"));
    },
    
    'blur input[type=text]': function() {
      if (Session.equals(EDITING_KEY, this.args.get("_id"))) {
        Session.set(EDITING_KEY, null);
      }
    },
    
    'keydown input[type=text]': function(event) {
      // ESC or ENTER
      if (event.which === 27 || event.which === 13) {
        event.preventDefault();
        event.target.blur();
      }
    },
    
    // update the text of the item on keypress but throttle the event to ensure
    // we don't flood the server with updates (handles the event at most once 
    // every 300ms)
    'keyup input[type=text]': _.throttle(function(event) {
      Todos.update(this.args.get("_id"), {$set: {text: event.target.value}});
    }, 300),
    
    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-delete-item, click .js-delete-item': function() {
      Todos.remove(this.args.get("_id"));
      if (! this.args.get("checked")) {
        Lists.update(this.args.get("listId"), {$inc: {incompleteCount: -1}});
      }
    }
  }
});