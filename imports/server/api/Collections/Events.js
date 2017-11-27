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
	updatedAt: {
		type: String,
		max: 25,
		label: 'The date this document was last updated.',
		autoValue() {
			if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
		},
	},
	hydrantId: {
		type: String,
		label: 'Hydrant id',
	},
	code: {
		type: Number,
		label: 'Event code',
	},
	edata: {
		type: Number,
		label: 'Event data',
		optional: true,
	},
	totalFlow: {
		type: Number,
		label: 'Flow sum',
		optional: true,
	},
	flowDuration: {
		type: Number,
		label: 'Flow duration',
		optional: true,
	},
});

Events.attachSchema(Events.schema);

Events.rawCollection().createIndex({ createdAt: 1 });
Events.rawCollection().createIndex({ createdAt: -1 });

Events.rawCollection().createIndex({ hydrantId: 1 });
Events.rawCollection().createIndex({ hydrantId: -1 });
Events.rawCollection().createIndex({ number: 1 });
Events.rawCollection().createIndex({ number: -1 });
Events.rawCollection().createIndex({ code: 1 });
Events.rawCollection().createIndex({ code: -1 });

export default Events;
