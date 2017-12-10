import { Meteor } from 'meteor/meteor';

const admin = require('firebase-admin');
// import * as admin from 'firebase-admin';

const { serviceAccount } = Meteor.settings.private;

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://hdapp-45a74.firebaseio.com'
});

export function sendNotification() {
// This registration token comes from the client FCM SDKs.
	const registrationToken = 'fjSGMKTLGcA:APA91bFe8ijYfo_Qt_8i92L1QJKDXxEZ67iBW5Ks5tdrtLqcUFuwmMt62b0yJxcpZsZEF9pHCpEI_9gz4a0kK0ODXv3lm3aGZOuLasT5oDVkxDkfoZfgVin1c4xoettA-7tsbhAimVYG';

	// See the "Defining the message payload" section below for details
	// on how to define a message payload.
	const payload = {
		notification: {
			title: '$GOOG up 1.43% on the day',
			body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
		}
	};
	// Send a message to the device corresponding to the provided
	// registration token.
	admin.messaging().sendToDevice(registrationToken, payload)
		.then((response) => {
			// See the MessagingDevicesResponse reference documentation for
			// the contents of response.
			console.log('Successfully sent message:', response);
		})
		.catch((error) => {
			console.log('Error sending message:', error);
		});
}
