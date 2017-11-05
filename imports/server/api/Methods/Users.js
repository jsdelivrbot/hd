import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import editProfile from '../Users/edit-profile';
import rateLimit from '../../../modules/server/rate-limit';

Meteor.methods({
	'users.sendVerificationEmail': () => {
		return Accounts.sendVerificationEmail(this.userId);
	},
	'users.editProfile': (profile) => {
		check(profile, {
			emailAddress: String,
			profile: {
				name: {
					first: String,
					last: String,
				},
			},
		});

		return editProfile({ userId: this.userId, profile })
			.then(response => response)
			.catch((exception) => {
				throw new Meteor.Error('500', exception);
			});
	},
});

rateLimit({
	methods: [
		'users.sendVerificationEmail',
		'users.editProfile',
	],
	limit: 5,
	timeRange: 1000,
});
