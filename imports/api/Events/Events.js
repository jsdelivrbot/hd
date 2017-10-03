/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { incrementCounter } from 'meteor/osv:mongo-counter';

const Events = new Mongo.Collection('Events');

Events.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});

Events.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

Events.schema = new SimpleSchema({
	createdAt: {
		type: String,
		label: 'The date this document was created.',
		defaultValue: (new Date()).toISOString(),
	},
	hydrantId: {
		type: String,
		label: 'Hydrant number',
	},
	number: {
		type: Number,
		label: 'Unique event autoincrement number.',
		autoValue() {
			if (this.isInsert) return incrementCounter('Counts', 'HydrantsSerialNumber');
		},
	},
	code: {
		type: Number,
		label: 'Event code',
	},
	edata: {
		type: Number,
		label: 'Event data',
	},
});

Events.attachSchema(Events.schema);

export default Events;
