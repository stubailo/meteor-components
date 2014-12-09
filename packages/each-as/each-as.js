// Write your package code here!

Template.let.helpers({
  merge: function (base, key, value) {
    base = base || {};
    var merged = _.clone(base);
    merged[key] = value;
    return merged;
  }
});