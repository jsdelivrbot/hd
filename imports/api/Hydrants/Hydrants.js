/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { incrementCounter } from 'meteor/osv:mongo-counter';

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
		type: String,
		label: 'The date this document was created.',
		autoValue() {
			if (this.isInsert && !this.isSet) return (new Date()).toISOString();
		},
	},
	updatedAt: {
		type: String,
		label: 'The date this document was last updated.',
		autoValue() {
			if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
		},
	},
	companyId: {
		type: Number,
		label: 'Company Id',
		defaultValue: 0,
	},
	number: {
		type: String,
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
		label: 'Last communication date',
		defaultValue: '0',
	},
	disableDate: {
		type: String,
		label: 'Disable date',
		defaultValue: '0',
	},
	disableText: {
		type: String,
		label: 'Disable text',
		defaultValue: '',
		max: 250,
	},
	address: {
		type: String,
		label: 'Address',
		max: 50,
		optional: true,
		defaultValue: '',
	},
	description: {
		type: String,
		label: 'Description',
		max: 50,
		optional: true,
		defaultValue: '',
	},
	enabled: {
		type: Boolean,
		label: 'Enabled',
		defaultValue: false,
	},
});

Hydrants.attachSchema(Hydrants.schema);

export default Hydrants;
