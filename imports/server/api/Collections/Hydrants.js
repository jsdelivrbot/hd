/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { incrementCounter } from 'meteor/osv:mongo-counter';
import moment from 'moment';

const Hydrants = new Mongo.Collection('Hydrants');

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
			if (this.isInsert || this.isUpdate) return moment().toDate();
		},
	},
	companyId: {
		type: String,
		max: 25,
		label: 'Company Id',
	},
	number: {
		type: SimpleSchema.Integer,
		label: 'Unique hydrant serial number.',
		autoValue() {
			if (this.isInsert) return incrementCounter('Counts', 'HydrantsSerialNumber');
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
		max: 99.999999,
		optional: true,
	},
	lon: {
		type: Number,
		label: 'Longitude',
		max: 99.999999,
		optional: true,
	},
	status: {
		type: SimpleSchema.Integer,
		label: 'Status',
		defaultValue: 0,
	},
	lastComm: {
		type: Date,
		label: 'Last communication date',
		optional: true,
	},
	disableDate: {
		type: Date,
		label: 'Disable date',
		optional: true,
	},
	disableText: {
		type: String,
		label: 'Disable text',
		max: 250,
		optional: true,
	},
	address: {
		type: String,
		max: 50,
		label: 'Address',
		optional: true,
	},
	description: {
		type: String,
		max: 50,
		label: 'Description',
		optional: true,
	},
	enabled: {
		type: Boolean,
		label: 'Enabled',
		defaultValue: true,
	},
	bodyBarcode: {
		type: String,
		label: 'Body barcode',
		max: 25,
		optional: true,
	},
	batchDate: {
		type: Date,
		label: 'Batch date',
		optional: true,
	},
	history: {
		type: String,
		label: 'History',
		max: 50,
		optional: true,
	},
	comments: {
		type: String,
		label: 'Comments',
		max: 50,
		optional: true,
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
Hydrants.rawCollection().createIndex({ description: 1 });
Hydrants.rawCollection().createIndex({ description: -1 });
Hydrants.rawCollection().createIndex({ address: 1 });
Hydrants.rawCollection().createIndex({ address: -1 });

export default Hydrants;
