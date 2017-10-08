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
	}
	return { $lt: past.toISOString() };
}
export function getHydrantFindFilter(fields = [], _dateKey, _statusKey  ) {
	const filter = {};
	const dateKey = _.defaultTo(_dateKey, getHydrantFilter().lastComm);
	const statusKey = _.defaultTo(_statusKey, getHydrantFilter().status);
	if (_.some(fields, 'date')) {
		filter.lastComm = mongoDateBack(dateKey);
	}
	if (_.some(fields, 'status')) {
		if (!_.isUndefined(statusKey)) filter.status = statusKey;
	}
	if (_.some(fields, 'id')) {
		const selectedHydrants = getSelectedHydrants();
		if (!_.isEmpty(selectedHydrants)) filter._id = { $in: selectedHydrants };
	}
}
