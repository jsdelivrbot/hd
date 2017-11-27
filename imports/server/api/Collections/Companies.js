/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { incrementCounter } from 'meteor/osv:mongo-counter';
import moment from 'moment';

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
	},
	contactPerson: {
		type: String,
		label: 'Contact Person',
		max: 50,
		optional: true,
	},
});

Companies.attachSchema(Companies.schema);

export default Companies;
