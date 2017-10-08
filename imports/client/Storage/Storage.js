/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

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
});

StorageCollection.attachSchema(StorageCollection.schema);

export function getHydrantSort() {
	return _.get(StorageCollection.findOne({}), 'hydrantSort', { name: 'lastComm', order: 1 });
}

export function setHydrantSort(sort) {
	StorageCollection.upsert(1, { $set: { hydrantSort: sort } });
}

export function getHydrantFilter() {
	console.log('getHydrantFilter');
	return _.get(StorageCollection.findOne({}), 'hydrantFilter', {});
}

export function setHydrantFilter(field, value) {
	const filter = getHydrantFilter();
	filter[field] = value;
	StorageCollection.upsert(1, { $set: { hydrantFilter: filter } });
}

export function getSelectedHydrants() {
	console.log('getselectedhydrants');
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

export function getHydrantFindFilter(fields = [], dateKey, sortState  ) {
	const filter = {};
	if (_.some(fields, 'date')) {
		const dateOffset = (24 * 60 * 60 * 1000);
		const now = (new Date()).getTime();
		const past = new Date();
		switch (_.defaultTo(dateKey, getHydrantFilter().lastComm)) {
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
		}
		filter.lastComm = {$lt: past.toISOString()};
	}
	if (_.some(fields, 'status')) {
	}
	if (_.some(fields, 'id')) {
	}
}
