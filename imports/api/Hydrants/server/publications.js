import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Hydrants from '../Hydrants';

Meteor.publish('hydrants', function hydrants() {
  return Hydrants.find();
});

// Note: hydrants.view is also used when editing an existing document.
Meteor.publish('hydrants.view', function hydrantsView(hydrantId) {
  check(hydrantId, String);
  return Hydrants.find({ _id: hydrantId });
});
