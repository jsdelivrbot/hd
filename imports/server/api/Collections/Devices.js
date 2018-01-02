/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

const Devices = new Mongo.Collection('Devices');

Devices.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});

Devices.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

Devices.schema = new SimpleSchema({
	createdAt: {
		type: Date,
		label: 'The date this document was created.',
		autoValue() {
			if (this.isInsert && !this.isSet) return moment().toDate();
		},
	},
	fcmToken: {
		type: String,
		max: 10000,
		label: 'fcm token',
	},
	info: {
		type: Object,
		label: 'device info',
	}
});

Devices.attachSchema(Devices.schema);

Devices.rawCollection().createIndex({ createdAt: 1 });
Devices.rawCollection().createIndex({ description: -1 });

export default Devices;
