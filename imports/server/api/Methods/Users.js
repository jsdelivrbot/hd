import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import editProfile from '../Users/edit-profile';
import rateLimit from '../../../modules/server/rate-limit';
import Companies from '../Collections/Companies';

Meteor.methods({
	'users.sendVerificationEmail': () => {
		return Accounts.sendVerificationEmail(this.userId);
	},
	'users.get.properties': () => {
		const { companyId, role } = this.Users.findOne({ _id: this.userId });
		const company = Companies.findOne({ _id: companyId });
		return { company, role };
	}
	,
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
