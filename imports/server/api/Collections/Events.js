/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { incrementCounter } from 'meteor/osv:mongo-counter';
import moment from 'moment';

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
	flowTotal: {
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
