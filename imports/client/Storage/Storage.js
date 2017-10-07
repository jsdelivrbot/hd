/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

const StorageCollection = new Mongo.Collection(null);

StorageCollection.schema = new SimpleSchema({
	hydrantSelected: {
		type: Array,
		label: 'Selected hydrant ids',
		defaultValue: [],
	},
	'hydrantSelected.$': String,
	hydrantFilter: {
		type: Object,
		label: 'Global hydrant filter',
		defaultValue: {},
	},
});

StorageCollection.attachSchema(StorageCollection.schema);

export function getHydrantFilter() {
	return _.get(StorageCollection.findOne({}), 'hydrantFilter', undefined);
}

export function setHydrantFilter(field, value) {
	StorageCollection.upsert(1, { $set: { `hydrantFilter.${field}`: value } });
}

export function getSelectedHydrants() {
	return StorageCollection.findOne({}) ? StorageCollection.findOne({}).hydrantSelected : [];
}

export function setSelectedHydrants(ids, isSelected) {
	let current = getSelectedHydrants();

	if (isSelected) current = _.uniq(_.concat(current, ids));
	else current = _.difference(current, _.castArray(ids));

	StorageCollection.upsert(1, { $set: { hydrantSelected: current } });
}

export function resetSelected(s) {
	if (s) StorageCollection.upsert(1, { $set: { hydrantSelected: s } });
	return s;
}

