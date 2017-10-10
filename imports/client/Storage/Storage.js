/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

// Schema

const StorageCollection = new Mongo.Collection(null);

StorageCollection.schema = new SimpleSchema({
	hydrantSelected: {
		type: Array,
		optional: true,
		label: 'Selected hydrant ids',
	},
	'hydrantSelected.$': String,
	hydrantFilter: {
		type: Object,
		blackbox: true,
		optional: true,
		label: 'Global hydrant filter',
	},
	hydrantSort: {
		type: Object,
		blackbox: true,
		optional: true,
		label: 'Global hydrant sort',
	},
	eventFilter: {
		type: Object,
		blackbox: true,
		optional: true,
		label: 'Global event filter',
	},
	eventSort: {
		type: Object,
		blackbox: true,
		optional: true,
		label: 'Global event sort',
	},
});

StorageCollection.attachSchema(StorageCollection.schema);

// Hydrants

export function getHydrantSort() {
	return _.get(StorageCollection.findOne({}), 'hydrantSort', { name: 'createdAt', order: 1 });
}

export function setHydrantSort(sort) {
	StorageCollection.upsert(1, { $set: { hydrantSort: sort } });
}

export function getHydrantFilter() {
	// console.log('getHydrantFilter');
	return _.get(StorageCollection.findOne({}), 'hydrantFilter', {});
}

export function setHydrantFilter(field, value) {
	const filter = getHydrantFilter();
	filter[field] = value;
	StorageCollection.upsert(1, { $set: { hydrantFilter: filter } });
}

export function getSelectedHydrants() {
	// console.log('getselectedhydrants');
	return _.get(StorageCollection.findOne(), 'hydrantSelected', []);
}

export function setSelectedHydrants(ids, isSelected) {
	let current = getSelectedHydrants();

	current = isSelected ?
		_.uniq(_.concat(current, ids))
		: _.difference(current, _.castArray(ids));

	StorageCollection.upsert(1, { $set: { hydrantSelected: current } });
}

export function resetSelected(s) {
	if (s) StorageCollection.upsert(1, { $set: { hydrantSelected: s } });
	return s;
}

// Events

export function getEventSort() {
	return _.get(StorageCollection.findOne({}), 'eventSort', { name: 'date', order: 1 });
}

export function setEventSort(sort) {
	StorageCollection.upsert(1, { $set: { eventSort: sort } });
}

export function getEventFilter() {
	// console.log('getEventFilter');
	return _.get(StorageCollection.findOne({}), 'eventFilter', {});
}

export function setEventFilter(field, value) {
	const filter = getEventFilter();
	filter[field] = value;
	StorageCollection.upsert(1, { $set: { eventFilter: filter } });
}

// Build Filter

function mongoDateBack(dateKey) {
	const dateOffset = (24 * 60 * 60 * 1000);
	const now = (new Date()).getTime();
	const past = new Date();
	switch (dateKey) {
		case 0:
			past.setTime(now - (dateOffset * 1));
			break;
		case 1:
			past.setTime(now - (dateOffset * 7));
			break;
		case 2:
			past.setTime(now - (dateOffset * 30));
			break;
		case 3:
			past.setTime(now - (dateOffset * 121));
			break;
		case 4:
			past.setTime(now - (dateOffset * 365));
			break;
		default:
			past.setTime(0);
	}
	return { $gt: past.toISOString() };
}

export function getHydrantFindFilter(
	{
		addDate,
		addStatus,
		addId,
		dateKey = getHydrantFilter().createdAt,
		statusKey = getHydrantFilter().status,
	}) {
	const filter = {};
	if (addDate) {
		filter.createdAt = mongoDateBack(dateKey);
	}

	if (addStatus) {
		if (!_.isEmpty(statusKey)) filter.status = { $in: _.keys(statusKey).map(k => _.toNumber(k)) };
	}
	if (addId) {
		const selectedHydrants = getSelectedHydrants();
		if (!_.isEmpty(selectedHydrants)) filter._id = { $in: selectedHydrants };
	}
	return filter;
}

export function getEventFindFilter({ dateKey, codeKey }) {
	const filter = {};

	filter.createdAt = mongoDateBack(dateKey);

	if (!_.isEmpty(codeKey)) filter.code = { $in: _.keys(codeKey).map(k => _.toNumber(k)) };

	return filter;
}

