import { Meteor } from 'meteor/meteor';
import Errors from '../../server/api/Collections/Errors';
import Hydrants from '../../server/api/Collections/Hydrants';
import Events from '../../server/api/Collections/Events';

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
	admin.messaging().sendToDevice(registrationTokens, payload)
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

export default function sendNotifications({ eventId }) {

	const event = Events.find(eventId);
	const {
	const hydrant = Hydrants.find(eventId.hydrantId);
	const payload = {
		notification: {
			title: 'Hydrant event',
			body: '***push to see***',
		},
		data: {
			eventId
		}
	};

}
