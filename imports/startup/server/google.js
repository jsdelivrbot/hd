import { Meteor } from 'meteor/meteor';
import _ from 'lodash';

import Messages from '../../server/api/Collections/Messages';
import Hydrants from '../../server/api/Collections/Hydrants';
import Events from '../../server/api/Collections/Events';
import Static from '../../server/api/Collections/Static';
import Companies from '../../server/api/Collections/Companies';

const admin = require('firebase-admin');

const { serviceAccount } = Meteor.settings.private;

console.log('initializing google');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://hdapp-45a74.firebaseio.com'
});

function sendNotification({ registrationTokens, payload }) {
	console.log('sending notification');
	// This registration token comes from the client FCM SDKs.
	// const registrationToken = 'fjSGMKTLGcA:APA91bGJu_z0zpfb393CaY5qrpatUJZTsXRx0M_n9dwwspPmCW6CAD298Q6Iauw47KQLHEW3zOelhqJQywc-iQ-E5R4vPOFz04qT3lT66SpKxNk5imkk5Jr3MhJz29vpXqfmorlWt0c5';

	// See the "Defining the message payload" section below for details
	// on how to define a message payload.
	// Send a message to the device corresponding to the provided
	// registration token...
	console.log('payload');
	console.log(payload);
	return admin.messaging().sendToDevice(registrationTokens, payload, { priority: 'high' })
		.then((response) => {
			// See the MessagingDevicesResponse reference documentation for
			// the contents of response.
			console.log('Successfully sent message:', response);
			console.log('results:', response.results);
		})
		.catch((error) => {
			console.log('Error sending message:', error);
		});
}

export default async function sendNotifications({ eventId }) {
	const event = Events.findOne(eventId);
	const { createdAt, code, edata } = event;

	const hydrant = Hydrants.findOne(event.hydrantId);
	const { number: hydrantNumber, address, lat, lon, companyId } = hydrant;
	const companyName = Companies.findOne(companyId);
	const codeText = Static.findOne({}).types.code[code];

	const payload = {
		data: {
			custom_notification: JSON.stringify({
				title: `הידרט #-${hydrantNumber}`,
				body: `${codeText}`,
				show_in_foreground: true,
				sound: 'default',
				priority: 'high',
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
	let usersSignedIn = Meteor.users.find(
		{
			fcmToken: { $exists: true },
			companyId: { $eq: companyId }
		}, {
			fields: { fcmToken: 1, _id: 1 },
		}
	).fetch();
	console.log('usersSignedIn', usersSignedIn);
	console.log('companyId', companyId, 'companyName', companyName);
	console.log();
	usersSignedIn = _.filter(usersSignedIn, fcmToken => fcmToken);
	if (!_.isEmpty(usersSignedIn)) {
		const registrationTokens = _.map(usersSignedIn, 'fcmToken');
		const userIds = _.map(usersSignedIn, '_id');

		console.log('usersSignedIn');
		console.log(usersSignedIn);
		console.log('registrationTokens');
		console.log(registrationTokens);
		console.log('userIds');
		console.log(userIds);
		console.log('dispatching');
		await sendNotification({ registrationTokens, payload });
		Messages.insert({ createdAt, eventId, userIds });
		console.log('dispatching successful');
	}
}
