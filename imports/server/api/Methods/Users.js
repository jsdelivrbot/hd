import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import editProfile from '../Users/edit-profile';
import rateLimit from '../../../modules/server/rate-limit';
import Companies from '../Collections/Companies';

Meteor.methods({
	'users.get.all': function anon() {
		return Meteor.users.aggregate([
			// { $lookup: {
			// 	from: 'Companies',
			// 	localField: 'companyId',
			// 	foreignField: '_id',
			// 	as: 'c'
			// } },
			// { $unwind: '$c' },
			{ $project: {
				name: { $concat: ['$profile.name.first', { $literal: ' ' }, '$profile.name.last'] },
				email: { $arrayElemAt: ['$emails', 0] },
				role: 1,
				companyId: 1,
				reset: '$services.password.reset',
				// companyName: '$c.name',
			} },
			{ $project: {
				name: 1,
				email: '$email.address',
				role: 1,
				companyName: 1,
				companyId: 1,
				reset: { $not: { $not: '$reset' } },
			} }
		]);
	},
	'user.sendVerificationEmail': function anon() {
		return Accounts.sendVerificationEmail(this.userId);
	},
	'user.new': function anon(p) {
		check(p, Object);
		const { email, firstName, lastName, companyId, role } = p;
		console.log('creating user');
		const userId = Accounts.createUser({ email });
		console.log('userId');
		console.log(userId);
		Meteor.users.update(userId, { $set: {
			profile: {
				name: {
					first: firstName,
					last: lastName,
				},
			},
			companyId,
			role,
		} });
		return Accounts.sendEnrollmentEmail(userId);
	},
	'user.get.properties': function anon() {
		const { companyId, role } = Meteor.user();
		const company = Companies.findOne({ _id: companyId });
		// if (companyId) company = Companies.findOne({ _id: companyId });
		// else {
		// 	company = Companies.findOne({});
		// 	companyId = company._id;
		// 	Meteor.users.update(this.userId, { $set: { companyId } });
		// }
		return { company, role };
	},
	'user.set.companyId': function anon(companyId) {
		check(companyId, String);
		Meteor.users.update(this.userId, { $set: { companyId } });
	},
	'user.update': function anon(p) {
		check(p, Object);
		let { _id, companyId, role } = p;
		Meteor.users.update(_id, { $set: { companyId, role } });
		return ({ _id, companyId, role } = Meteor.user());
	},
	'user.editProfile': function anon(profile) {
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
		'user.sendVerificationEmail',
		'user.editProfile',
	],
	limit: 5,
	timeRange: 1000,
});
