/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import Events from '../Events';

Meteor.publish('events', function events() {
	return Events.find();
});
