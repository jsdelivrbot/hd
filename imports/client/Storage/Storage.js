/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const StorageCollection = new Mongo.Collection(null);

StorageCollection.schema = new SimpleSchema({
	hydrantSelected: {
		type: String,
		label: 'Selected hydrant id',
		defaultValue: undefined,
	},
});

StorageCollection.attachSchema(StorageCollection.schema);

export function getSelectedHydrants() {
	return StorageCollection.findOne({}) ? StorageCollection.findOne({}).hydrantSelected : undefined;
}

export function setSelectedHydrants(s) {
	const old = getSelectedHydrants();
	if (s) StorageCollection.upsert(1, { $set: { hydrantSelected: old.push(s) } });
}

export function resetSelected(s) {
	if (s) StorageCollection.upsert(1, { $set: { hydrantSelected: s } });
}

