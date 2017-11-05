/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { incrementCounter } from 'meteor/osv:mongo-counter';

const Companies = new Mongo.Collection('Companies');

Companies.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});

Companies.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

Companies.schema = new SimpleSchema({
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
	number: {
		type: String,
		label: 'Unique hydrant serial number.',
		autoValue() {
			if (this.isInsert) return String(incrementCounter('Counts', 'CompaniesSerialNumber'));
		},
	},
	name: {
		type: String,
		label: 'Name',
		max: 50,
	},
	address: {
		type: String,
		label: 'Address',
		max: 50,
		optional: true,
		defaultValue: '',
	},
	contactPerson: {
		type: String,
		label: 'Contact Person',
		max: 50,
		optional: true,
		defaultValue: '',
	},
});

Companies.attachSchema(Companies.schema);

export default Companies;