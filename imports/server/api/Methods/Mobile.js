import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import to from 'await-to-js';
import moment from 'moment';
import editProfile from '../Users/edit-profile';
import rateLimit from '../../Utils/rate-limit';
import Companies from '../Collections/Companies';
import Devices from '../Collections/Devices';
import * as roles from '../../Utils/roles';
import { getCustomDeviceId } from '../../Utils/utils';
import Hydrants from '../Collections/Hydrants';

Meteor.methods({
	'mobile.hydrant.insert': function anon(p) {
		check(p, Object);
		if (!p) return undefined;
		const { user: mobileUser, deviceInfo, doc } = p;
		if (!roles.isUserAdminOrSecurity({ deviceInfo, user: mobileUser })) return undefined;
		console.log('mobile.hydrant.insert', 'p', 'user', mobileUser, 'doc', doc);

		if (doc.batchDate) doc.batchDate = moment(doc.batchDate, 'DD/MM/YYYY').toDate();
		console.log('doc.batchDate', doc.batchDate);
		const _id = Meteor.call('hydrants.insert', doc);
		if (_id) {
			console.log('mobile inserting hydrant');
			return { _id, number: Hydrants.findOne(_id).number };
		}
		return undefined;
	},
	'mobile.user.sync': function anon(p) {
		check(p, Object);
		if (!p) return undefined;
		const { fcmToken, flag, user: mobileUser, deviceInfo } = p;
		if (flag == 'connect') return { status: 'OK' };

		if (!roles.isUserAdminOrSecurity({ deviceInfo, user: mobileUser })) return undefined;
		const userId = (mobileUser && mobileUser.userId) || _.get(Meteor.user(), '_id');
		if (!userId || !deviceInfo) return undefined;
		const customDeviceId = getCustomDeviceId({ deviceInfo });
		console.log('user.mobile.sync', '"fcmToken"', fcmToken, '"flag"', flag, '"userId"', userId, '"deviceInfo"', deviceInfo != undefined, 'customDeviceId', customDeviceId);

		const removeDeviceFromAllUsers = () => {
			Meteor.users.update(
				{ },
				{ $unset: { 'customDeviceId.$[element]': 1 } },
				{ arrayFilters: [{ element: customDeviceId }] }
			);
		};
		const removeDeviceFromUser = () => {
			Meteor.users.update(
				userId,
				{ $pull: { customDeviceId } },
			);
		};
		const addDeviceToUser = () => {
			Meteor.users.update(
				userId,
				{ $addToSet: { customDeviceId } },
			);
		};
		const upsertDevice = () => {
			if (Devices.findOne({ customDeviceId })) {
				Devices.update({ customDeviceId }, { $set: {
					fcmToken,
					deviceInfo,
					userId,
				} });
			} else {
				Devices.insert({
					fcmToken,
					deviceInfo,
					customDeviceId,
					userId,
				});
			}
		};

		if (flag == 'connect') {
			return { status: 'OK' };
		} else if (flag == 'login') {
			removeDeviceFromAllUsers();
			addDeviceToUser();
			upsertDevice();
			const { user } = Meteor.call('user.get.properties');
			user.role = roles.userRoleAsString(user.role);
			return { user };
		} else if (flag == 'logout') {
			removeDeviceFromUser();
		} else {
			upsertDevice();
		}
		return true;
	},
});

rateLimit({
	methods: [
		'mobile.user.sync'
	],
	limit: 5,
	timeRange: 1000,
});

// const email = p.email || _.get(Meteor.user(), 'emails[0].address');

// 'user.set.fcmtoken': function anon(p) {   // for one token
// 	check(p, Object);
// 	const { fcmToken, flag, email } = p;
// 	console.log('user.set.fcmtoken ', 'fcmToken ', fcmToken, 'flag ', flag, 'email ', email);
//
// 	const removeTokenFromAllUsers = () => {
// 		if (!fcmToken) return;
// 		Meteor.users.update({ fcmToken }, { $unset: { fcmToken: 1 } });
// 	};
// 	const cleanUserToken = () => {
// 		if (!email) return;
// 		Meteor.users.update({ 'emails.0.address': email }, { $unset: { fcmToken: 1 } });
// 	};
// 	const updateUserToken = () => {
// 		if (!fcmToken) return;
// 		if (!email) return;
// 		Meteor.users.update({ 'emails.0.address': email }, { $set: { fcmToken } });
// 	};
//
// 	if (flag == 'logout') {
// 		removeTokenFromAllUsers();
// 		cleanUserToken();
// 	} else {
// 		updateUserToken();
// 	}
// },

// const createUserToken = () => {
// 	if (!fcmToken) return;
// 	Meteor.users.update({ 'emails[0].address': email }, { $set: { fcmToken } });
// };

// if (flag == 'login') {
// 	removeTokenFromAllUsers();
// 	createUserToken();


// 'user.getUserDetailsForFCMToken': function anon(p) {
// 	check(p, Object);
// 	console.log('user.getUserDetailsForFCMToken');
// 	const { fcmToken } = p;
// 	console.log('fcmToken');
// 	console.log(fcmToken);
// 	console.log('user');
// 	const user = Meteor.users.findOne({ fcmToken });
// 	console.log(user);
// 	if (!user) return {};
// 	const { role, companyId } = user;
// 	const name = `${user.profile.name.first} ${user.profile.name.last}`;
// 	const email = user.emails[0].address;
// 	const companyName = Companies.findOne(companyId);
// 	return { email, name, role, companyId, companyName };
// },

// 'user.sendVerificationEmail': function anon() {
// 	return Accounts.sendVerificationEmail(this.userId);
// },

// if (companyId) company = Companies.findOne({ _id: companyId });
// else {
// 	company = Companies.findOne({});
// 	companyId = company._id;
// 	Meteor.users.update(this.userId, { $set: { companyId } });
// }

// { $lookup: {
// 	from: 'Companies',
// 	localField: 'companyId',
// 	foreignField: '_id',
// 	as: 'c'
// } },
// { $unwind: '$c' },
// companyName: '$c.name',
