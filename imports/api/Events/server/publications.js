/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Events from '../Events';

Meteor.publish('events', function events(hydrantId) {
	check(hydrantId, String);
	return Events.find({ hydrantId });
});
