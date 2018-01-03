/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

const Errors = new Mongo.Collection('Errors');

Errors.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});

Errors.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

Errors.schema = new SimpleSchema({
	createdAt: {
		type: Date,
		label: 'The date this document was created.',
		autoValue() {
			if (this.isInsert && !this.isSet) return moment().toDate();
		},
	},
	description: {
		type: String,
		max: 350,
		label: 'Description',
	},
	data: {
		type: Array,
		max: 350,
		label: 'data',
		optional: true,
	},
	'data.$': {
		type: Object,
		blackbox: true,
	},
});

Errors.attachSchema(Errors.schema);

Errors.rawCollection().createIndex({ createdAt: 1 });
Errors.rawCollection().createIndex({ description: -1 });

export default Errors;
