import { Meteor } from 'meteor/meteor';

const admin = require('firebase-admin');
// import * as admin from 'firebase-admin';

const { serviceAccount } = Meteor.settings.private;
// console.log(serviceAccount);

console.log('initializing google');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://hdapp-45a74.firebaseio.com'
});

export function sendNotification() {
	console.log('sending notification');
	// This registration token comes from the client FCM SDKs.
	const registrationToken = 'fjSGMKTLGcA:APA91bGJu_z0zpfb393CaY5qrpatUJZTsXRx0M_n9dwwspPmCW6CAD298Q6Iauw47KQLHEW3zOelhqJQywc-iQ-E5R4vPOFz04qT3lT66SpKxNk5imkk5Jr3MhJz29vpXqfmorlWt0c5';

	// See the "Defining the message payload" section below for details
	// on how to define a message payload.
	const payload = {
		notification: {
			title: 'title of pavel sending message ',
			body: 'body of pavel sending message'
		}
	};
	// Send a message to the device corresponding to the provided
	// registration token...
	admin.messaging().sendToDevice(registrationToken, payload)
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
