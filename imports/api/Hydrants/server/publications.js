/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Hydrants from './Hydrants';

Meteor.publish('hydrants', function hydrants() {
	return Hydrants.find();
});

Meteor.publish('hydrants.view', function hydrantsView(hydrantId) {
	check(hydrantId, String);
	return Hydrants.find({ _id: hydrantId });
});
