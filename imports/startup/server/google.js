import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import to from 'await-to-js';

import Messages from '../../server/api/Collections/Messages';
import Hydrants from '../../server/api/Collections/Hydrants';
import Events from '../../server/api/Collections/Events';
import Static from '../../server/api/Collections/Static';
import Companies from '../../server/api/Collections/Companies';
import Errors from '../../server/api/Collections/Errors';

const admin = require('firebase-admin');

const { serviceAccount } = Meteor.settings.private;

console.log('initializing google');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://hdapp-45a74.firebaseio.com'
});

function sendNotification({ token, payload }) {
	// This registration token comes from the client FCM SDKs.
	// const registrationToken = 'fjSGMKTLGcA:APA91bGJu_z0zpfb393CaY5qrpatUJZTsXRx0M_n9dwwspPmCW6CAD298Q6Iauw47KQLHEW3zOelhqJQywc-iQ-E5R4vPOFz04qT3lT66SpKxNk5imkk5Jr3MhJz29vpXqfmorlWt0c5';

	// See the "Defining the message payload" section below for details
	// on how to define a message payload.
	// Send a message to the device corresponding to the provided
	// registration token...
	return admin.messaging().sendToDevice(token, payload, { priority: 'high' });
	// .then((response) => {
	// 	// See the MessagingDevicesResponse reference documentation for
	// 	// the contents of response.
	// 	console.log('Successfully sent message:', response);
	// 	console.log('results:', response.results);
	// })
	// .catch((error) => {
	// 	console.log('Error sending message:', error);
	// });
}

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
				sub_text: 'This is a subText',
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
				ongoing: true,
				lights: true,
				color: 'blue',
				event: {
					eventId,
					createdAt,
					code,
					codeText,
					edata,
					hydrantNumber,
					address,
					lat,
					lon,
					companyId,
					companyName
				}
			})
		}
	};
	const usersSignedIn = Meteor.users.find(
		{
			fcmToken: { $exists: true },
			companyId: { $eq: companyId }
		}, {
			fields: { fcmToken: 1, _id: 1 },
		}
	).fetch();

	const users = [];
	const errorData = [];
	await _.reduce(usersSignedIn, async (r1, user) => (
		await _.reduce(user.fcmToken, async (r2, token) => {
			console.log('token', token);
			const [err] = await to(sendNotification({ token, payload }));
			console.log('err', err);
			if (err) {
				errorData.push({ userId: user._id, token, description: `Error sending notification: ${err}` });
			} else {
				console.log('hehr');
				users.push({ userId: user._id, token });
			}
			return err;
		}, { })
	), { });
	console.log('users', users);
	console.log('errorData', errorData);
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
}
