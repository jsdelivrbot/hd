/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import _ from 'lodash';
import moment from 'moment';

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
	eventSlider: {
		type: Object,
		blackbox: true,
		optional: true,
		label: 'Event slider',
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

export function getEventSlider() {
	console.log('getting');
	return _.get(StorageCollection.findOne({}), 'eventSlider');
}

export function setEventSlider(slider) {
	console.log('setting');
	StorageCollection.upsert(1, { $set: { eventSlider: slider } });
}

export function getEventSort() {
	return _.get(StorageCollection.findOne({}), 'eventSort', { name: 'createdAt', order: 1 });
}

export function setEventSort(sort) {
	StorageCollection.upsert(1, { $set: { eventSort: sort } });
}

export function getEventFilter() {
	console.log('getEventFilter');
	console.log(_.get(StorageCollection.findOne({}), 'eventFilter', {}));
	return _.get(StorageCollection.findOne({}), 'eventFilter', {});
}

export function setEventFilter(field, value) {
	const filter = getEventFilter();
	filter[field] = value;
	StorageCollection.upsert(1, { $set: { eventFilter: filter } });
}

// Build Filter

function mongoDateBack(keyDate) {
	const dateOffset = (24 * 60 * 60 * 1000);
	let now = (new Date()).getTime();
	now = 10000000 * Math.round(now / 10000000);
	// console.log(now);
	const past = new Date();
	switch (keyDate) {
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
	// date = moment("2017-10-13T15:53:20.000Z").subtract(100000, 'days').toISOString();
	return { $gt: past.toISOString() };
}

export function getHydrantFindFilter(
	{
		addDate,
		addStatus,
		addId,
		addAddress,
		addDescription,
		addNumber,
		keyAddress = getHydrantFilter().address,
		keyDescription = getHydrantFilter().description,
		keyNumber = getHydrantFilter().number,
		keyDate = getHydrantFilter().createdAt,
		keyStatus = getHydrantFilter().status,
	}) {
	const filter = {};
	if (addDate) {
		filter.createdAt = mongoDateBack(keyDate);
	}

	if (addNumber && keyNumber) {
		filter.number = { $regex: keyNumber };
		console.log(filter.number);
	}
	if (addAddress && keyAddress) {
		filter.address = { $regex: keyAddress };
	}
	if (addDescription && keyDescription) {
		filter.description = { $regex: keyDescription };
	}
	if (addStatus) {
		if (!_.isEmpty(keyStatus)) filter.status = { $in: _.keys(keyStatus).map(k => _.toNumber(k)) };
	}
	if (addId) {
		const selectedHydrants = getSelectedHydrants();
		if (!_.isEmpty(selectedHydrants)) filter._id = { $in: selectedHydrants };
	}
	return filter;
}

export function getEventFindFilter({ keyDate, codeKey }) {
	const filter = {};

	filter.createdAt = mongoDateBack(keyDate);

	if (!_.isEmpty(codeKey)) filter.code = { $in: _.keys(codeKey).map(k => _.toNumber(k)) };

	return filter;
}

export function getEventsBackendFilterParams() {
	const filterE = {};
	const keyDateE = getEventFilter().createdAt;
	const keyCode = getEventFilter().code;

	filterE.createdAt = mongoDateBack(keyDateE);

	if (!_.isEmpty(keyCode)) {
		filterE.code = { $in: _.keys(keyCode).map(k => _.toNumber(k)) };
	}

	return filterE;
}


// export function getEventsBackendFilterParams() {
// 	// Hydrants collection
// 	const filterH = {};
//
// 	const keyAddress = getHydrantFilter().address;
// 	const keyDescription = getHydrantFilter().description;
// 	const keyNumber = getHydrantFilter().number;
// 	const keyDateH = getHydrantFilter().createdAt;
// 	const keyStatus = getHydrantFilter().status;
//
// 	filterH.createdAt = mongoDateBack(keyDateH);
//
// 	const selectedHydrants = getSelectedHydrants();
// 	if (!_.isEmpty(selectedHydrants)) {
// 		filterH._id = { $in: selectedHydrants };
// 	} else {
// 		if (keyNumber) {
// 			filterH.number = { $regex: keyNumber };
// 		}
// 		if (keyAddress) {
// 			filterH.address = { $regex: keyAddress };
// 		}
// 		if (keyDescription) {
// 			filterH.description = { $regex: keyDescription };
// 		}
// 		if (!_.isEmpty(keyStatus)) {
// 			filterH.status = { $in: _.keys(keyStatus).map(k => _.toNumber(k)) };
// 		}
// 	}
//
// 	// Events collection
//
// 	const filterE = {};
// 	const keyDateE = getEventFilter().createdAt;
// 	const keyCode = getEventFilter().code;
//
// 	filterE.createdAt = mongoDateBack(keyDateE);
//
// 	if (!_.isEmpty(keyCode)) {
// 		filterE.code = { $in: _.keys(keyCode).map(k => _.toNumber(k)) };
// 	}
//
// 	return { filterH, filterE };
// }


// export function getEventsBackendFilterParams({ keyDateE, keyCode }) {
//
// 	// Hydrants collection
//
// 	const filterH = {};
//
// 	const keyAddress = getHydrantFilter().address;
// 	const keyDescription = getHydrantFilter().description;
// 	const keyNumber = getHydrantFilter().number;
// 	const keyDateH = getHydrantFilter().createdAt;
// 	const keyStatus = getHydrantFilter().status;
//
// 	filterH.createdAt = mongoDateBack(keyDateH);
//
// 	const selectedHydrants = getSelectedHydrants();
// 	if (!_.isEmpty(selectedHydrants)) {
// 		filterH._id = { $in: selectedHydrants };
// 	} else {
// 		if (keyNumber) {
// 			filterH.number = { $regex: keyNumber };
// 		}
// 		if (keyAddress) {
// 			filterH.address = { $regex: keyAddress };
// 		}
// 		if (keyDescription) {
// 			filterH.description = { $regex: keyDescription };
// 		}
// 		if (!_.isEmpty(keyStatus)) {
// 			filterH.status = { $in: _.keys(keyStatus).map(k => _.toNumber(k)) };
// 		}
// 	}
//
// 	// Events collection
//
// 	const filterE = {};
// 	filterE.createdAt = mongoDateBack(keyDateE);
//
// 	if (!_.isEmpty(keyCode)) {
// 		filterE.code = { $in: _.keys(keyCode).map(k => _.toNumber(k)) };
// 	}
//
// 	return { filterH, filterE };
// }
