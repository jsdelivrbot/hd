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
		defaultValue: moment().toDate(),
	},
	description: {
		type: String,
		max: 350,
		label: 'Description',
	},
});

Errors.attachSchema(Errors.schema);

Errors.rawCollection().createIndex({ createdAt: 1 });
Errors.rawCollection().createIndex({ description: -1 });

export default Errors;
