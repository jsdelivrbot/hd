import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import editProfile from '../Users/edit-profile';
import rateLimit from '../../../modules/server/rate-limit';
import Companies from '../Collections/Companies';

Meteor.methods({
	'users.sendVerificationEmail': function anon() {
		return Accounts.sendVerificationEmail(this.userId);
	},
	'users.get.properties': function anon() {
		let { companyId, role } = Meteor.user();

		console.log('Meteor.user()');
		console.log(Meteor.user());
		console.log('this.user()');
		console.log(Meteor.user());
		let company;
		if (companyId) company = Companies.findOne({ _id: companyId });
		else {
			company = Companies.findOne({});
			companyId = company._id;
			Meteor.users.update(this.userId, { $set: { companyId } });
		}
		console.log('role');
		console.log(role);
		console.log('company');
		console.log(company);
		console.log('companyId');
		console.log(companyId);
		return { company, role };
	},
	'user.set.companyId': function anon(companyId) {
		check(companyId, String);
		Meteor.users.update(this.userId, { $set: { companyId } });
	},
	'users.editProfile': function anon(profile) {
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
