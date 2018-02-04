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
	updatedAt: {
		type: Date,
		label: 'The date this document was last updated.',
		autoValue() {
			if (this.isInsert || this.isUpdate || this.isUpsert) return moment().toDate();
		},
	},
	fcmToken: {
		type: String,
		max: 1000,
		label: 'fcm token',
		optional: true,
	},
	userId: {
		type: String,
		max: 100,
		label: 'user id',
	},
	customDeviceId: {
		type: String,
		max: 1000,
		label: 'user id',
	},
	deviceInfo: {
		type: Object,
		blackbox: true,
		label: 'device info',
	}
});

Devices.attachSchema(Devices.schema);

Devices.rawCollection().createIndex({ createdAt: 1 });
Devices.rawCollection().createIndex({ description: -1 });

export default Devices;
