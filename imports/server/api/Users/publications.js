/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

Meteor.publish('user.editProfile', function usersProfile() {
	return Meteor.users.find(this.userId, {
		fields: {
			emails: 1,
			profile: 1,
			services: 1,
		},
	});
});
