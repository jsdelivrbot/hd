/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

const Messages = new Mongo.Collection('Messages');

Messages.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});

Messages.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

Messages.schema = new SimpleSchema({
	createdAt: {
		type: Date,
		label: 'The date event was created.',
	},
	eventId: {
		type: String,
		label: 'Event id',
	},
	userIds: {
		type: Array,
		label: 'User ids',
	},
	'userIds.$': String,
});

Messages.attachSchema(Messages.schema);

Messages.rawCollection().createIndex({ createdAt: 1 });
Messages.rawCollection().createIndex({ createdAt: -1 });
Messages.rawCollection().createIndex({ eventId: 1 });
Messages.rawCollection().createIndex({ eventId: -1 });

export default Messages;
