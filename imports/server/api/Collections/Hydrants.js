/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { incrementCounter } from 'meteor/osv:mongo-counter';
import moment from 'moment';

const Hydrants = new Mongo.Collection('Hydrants');

console.log('hydrants collection');

Hydrants.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});

Hydrants.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

Hydrants.schema = new SimpleSchema({
	createdAt: {
		type: String,
		max: 25,
		label: 'The date this document was created.',
		autoValue() {
			if (this.isInsert && !this.isSet) return (new Date()).toISOString();
		},
	},
	updatedAt: {
		type: String,
		max: 25,
		label: 'The date this document was last updated.',
		autoValue() {
			if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
		},
	},
	companyId: {
		type: String,
		max: 25,
		label: 'Company Id',
		defaultValue: 0,
	},
	number: {
		type: String,
		max: 25,
		label: 'Unique hydrant serial number.',
		autoValue() {
			if (this.isInsert) return String(incrementCounter('Counts', 'HydrantsSerialNumber'));
		},
	},
	sim: {
		type: String,
		label: 'Unique sim ID number.',
		max: 24,
	},
	lat: {
		type: Number,
		label: 'Latitude',
		defaultValue: 0,
	},
	lon: {
		type: Number,
		label: 'Longitude',
		defaultValue: 0,
	},
	status: {
		type: Number,
		label: 'Status',
		defaultValue: 0,
	},
	lastComm: {
		type: String,
		max: 25,
		label: 'Last communication date',
		optional: true,
	},
	disableDate: {
		type: String,
		max: 25,
		label: 'Disable date',
		optional: true,
	},
	disableText: {
		type: String,
		max: 250,
		label: 'Disable text',
		defaultValue: '',
		optional: true,
	},
	address: {
		type: String,
		max: 50,
		label: 'Address',
		optional: true,
		defaultValue: '',
	},
	description: {
		type: String,
		max: 50,
		label: 'Description',
		optional: true,
		defaultValue: '',
	},
	enabled: {
		type: Boolean,
		label: 'Enabled',
		defaultValue: false,
	},
	bodyBarcode: {
		type: String,
		max: 25,
		label: 'Body barcode',
		optional: true,
		defaultValue: '',
	},
	batchDate: {
		type: String,
		max: 25,
		label: 'Batch date',
		optional: true,
		defaultValue: '',
	},
	history: {
		type: String,
		max: 50,
		label: 'History',
		optional: true,
		defaultValue: '',
	},
	comments: {
		type: String,
		max: 50,
		label: 'Comments',
		optional: true,
		defaultValue: '',
	},
});

Hydrants.attachSchema(Hydrants.schema);

Hydrants.rawCollection().createIndex({ companyId: 1 });
Hydrants.rawCollection().createIndex({ companyId: -1 });
Hydrants.rawCollection().createIndex({ number: 1 });
Hydrants.rawCollection().createIndex({ number: -1 });
Hydrants.rawCollection().createIndex({ lat: 1 });
Hydrants.rawCollection().createIndex({ lat: -1 });
Hydrants.rawCollection().createIndex({ lon: 1 });
Hydrants.rawCollection().createIndex({ lon: -1 });
Hydrants.rawCollection().createIndex({ status: 1 });
Hydrants.rawCollection().createIndex({ status: -1 });
Hydrants.rawCollection().createIndex({ lastComm: 1 });
Hydrants.rawCollection().createIndex({ lastComm: -1 });
Hydrants.rawCollection().createIndex({ enabled: 1 });
Hydrants.rawCollection().createIndex({ enabled: -1 });

export default Hydrants;
