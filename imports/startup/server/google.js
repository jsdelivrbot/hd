import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import to from 'await-to-js';

import Messages from '../../server/api/Collections/Messages';
import Hydrants from '../../server/api/Collections/Hydrants';
import Events from '../../server/api/Collections/Events';
import Static from '../../server/api/Collections/Static';
import Companies from '../../server/api/Collections/Companies';
import Errors from '../../server/api/Collections/Errors';
import Devices from '../../server/api/Collections/Devices';

const admin = require('firebase-admin');

const { serviceAccount } = Meteor.settings.private;

console.log('initializing google');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://hdapp-45a74.firebaseio.com'
});

const sendNotification = ({ token, payload }) => (
	admin.messaging().sendToDevice(token, payload, { priority: 'high' })
);

export default async function sendNotifications({ eventId }) {
	const event = Events.findOne(eventId);
	const { createdAt, code, edata } = event;

	const hydrant = Hydrants.findOne(event.hydrantId);
	const { number: hydrantNumber, address, lat, lon, companyId } = hydrant;
	const companyName = Companies.findOne(companyId).name;
	const codeText = Static.findOne({}).types.code[code];

	const payload = {
		data: {
			custom_notification: JSON.stringify({
				title: `הידרנט # - ${hydrantNumber}`,
				body: `${codeText}`,
				show_in_foreground: true,
				sound: 'default',
				priority: 'high',
				large_icon: 'ic_launcher',
				// icon: 'ic_launcher',
				// badge: 10,
				// number: 5,
				// click_action: 'ACTION',
				// ticker: 'My Notification Ticker',
				// big_text: 'Show when notification is expanded',
				vibrate: 300,
				wake_screen: true,
				// picture: 'https://www.google.com.ua/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwjQxIfJ1b7YAhUCy6QKHcPdCq8QjRwIBw&url=http%3A%2F%2Fwww.qygjxz.com%2Fsearch-images.html&psig=AOvVaw1uvfHxCadGWy5rkgYCH-Ho&ust=1515167661403289',
				// sub_text: 'This is a subText',
				// ongoing: true,
				lights: true,
				color: '#39aeed',
				event: {
					eventId,
					// createdAt,
					// code,
					// codeText,
					// edata,
					// hydrantNumber,
					// address,
					// lat,
					// lon,
					// companyId,
					// companyName
				}
			})
		}
	};
	// let usersSignedIn = Meteor.users.aggregate([
	// 	{ $lookup: {
	// 		from: 'Devices',
	// 		localField: 'hydrantId',
	// 		foreignField: '_id',
	// 		as: 'h'
	// 	} },
	// 	{ $unwind: '$h' },
	// 	{ $match: { 'h.companyId': p.companyId } },
	// 	{ $match: { createdAt: { $gt: new Date(p.createdAt) } } },
	// 	{ $project: {
	// 		_id: 1,
	// 		customDeviceId: 1,
	// 	} },
	// ], { allowDiskUse: true });
	const usersSignedIn = Meteor.users.find(
		{
			customDeviceId: { $exists: true },
			companyId: { $eq: companyId }
		}, {
			fields: { customDeviceId: 1, _id: 1 },
		}
	).fetch();
	// usersSignedIn = _.map(usersSignedIn, ({ customDeviceId }) => ({
	// 	token: _.get(Devices.findOne({ customDeviceId }), 'fcmToken')
	// }));
	const users = [];
	const errorData = [];
	await _.reduce(usersSignedIn, async (r1, user) => (
		await _.reduce(user.customDeviceId, async (r2, customDeviceId) => {
			const token = _.get(Devices.findOne({ customDeviceId }), 'fcmToken');
			// console.log('token', token);
			if (token) {
				const [err] = await to(sendNotification({ token, payload }));
				if (err) {
					errorData.push({ userId: user._id, token, description: `Error sending notification: ${err}` });
				} else {
					// console.log('hehr');
					users.push({ userId: user._id, token });
				}
				// console.log('err', err);
			}
		}, { })
	), { });

	if (!_.isEmpty(users)) {
		Messages.insert({ createdAt, eventId, users });
	}
	if (!_.isEmpty(errorData)) {
		Errors.insert({ description: 'Error sending notification', data: errorData });
	}

	console.log('sendNotifications',
		'hydrantNumber', hydrantNumber,
		'companyId', companyId,
		'companyName', companyName,
		'number sent', users.length,
		'number not sent', errorData.length
	);
	console.log('users', users);
	console.log('errorData', errorData);
}
