import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
// import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var'
import _ from 'lodash';

const StorageCollection = new Mongo.Collection(null);

function getStore(field, keys) {
	let result = _.get(StorageCollection.findOne({}), field);
	if (result && keys) {
		result = result[keys];
	}
	// console.log('-----getStore');
	// console.log('field');
	// console.log(field);
	// console.log('keys');
	// console.log(keys);
	// console.log('result');
	// console.log(result);
	return result;
}
function setStore(field, obj) {
	StorageCollection.upsert(1, { $set: { [`${field}.${_.keys(obj)[0]}`]: _.values(obj)[0] } });
	// console.log('-----setStore');
	// console.log('field');
	// console.log(field);
	// console.log('obj');
	// console.log(obj);
	return obj;
}

async function getStoreGlobal(keys) {
	let result = _.get(StorageCollection.findOne({}), 'global');
	if (result && keys) {
		result = result[keys];
	}
	if (keys === 'types' && !result) {
		result = await Meteor.callPromise('get.types');
		setStore('global', { types: result });
	}
	// console.log('-----getStore');
	// console.log('field');
	// console.log(field);
	// console.log('keys');
	// console.log(keys);
	// console.log('result');
	// console.log(result);
	return result;
}

const reactiveVar = new ReactiveVar({});

export { getStore, getStoreGlobal, setStore, reactiveVar };

// export function getHydrantSort() {
// 	return _.get(StorageCollection.findOne({}), 'hydrantSort');
// }
//
// export function setHydrantSort(sort) {
// 	StorageCollection.upsert(1, { $set: { hydrantSort: sort } });
// }
//
// export function getHydrantFilter() {
// 	return _.get(StorageCollection.findOne({}), 'hydrantFilter', {});
// }
//
// export function setHydrantFilter(field, value) {
// 	const filter = getHydrantFilter();
// 	filter[field] = value;
// 	StorageCollection.upsert(1, { $set: { hydrantFilter: filter } });
// }
//
// export function getEventSlider() {
// 	return _.get(StorageCollection.findOne({}), 'eventSlider');
// }
//
// export function setEventSlider(slider) {
// 	StorageCollection.upsert(1, { $set: { eventSlider: slider } });
// }
//
// export function getEventSort() {
// 	return _.get(StorageCollection.findOne({}), 'eventSort', { name: 'createdAt', order: 1 });
// }
//
// export function setEventSort(sort) {
// 	StorageCollection.upsert(1, { $set: { eventSort: sort } });
// }
//
// export function getEventFilter() {
// 	return _.get(StorageCollection.findOne({}), 'eventFilter', {});
// }
//
// export function setEventFilter(field, value) {
// 	const filter = getEventFilter();
// 	filter[field] = value;
// 	StorageCollection.upsert(1, { $set: { eventFilter: filter } });
// }
//
//
// export function getHydrantFindFilter(
// 	{
// 		addDate,
// 		addStatus,
// 		addId,
// 		addAddress,
// 		addDescription,
// 		addNumber,
// 		keyAddress = getHydrantFilter().address,
// 		keyDescription = getHydrantFilter().description,
// 		keyNumber = getHydrantFilter().number,
// 		keyDate = getHydrantFilter().createdAt,
// 		keyStatus = getHydrantFilter().status,
// 	}) {
// 	const filter = {};
// 	if (addDate) {
// 		filter.createdAt = mongoDateBack(keyDate);
// 	}
//
// 	if (addNumber && keyNumber) {
// 		filter.number = { $regex: keyNumber };
// 		console.log(filter.number);
// 	}
// 	if (addAddress && keyAddress) {
// 		filter.address = { $regex: keyAddress };
// 	}
// 	if (addDescription && keyDescription) {
// 		filter.description = { $regex: keyDescription };
// 	}
// 	if (addStatus) {
// 		if (!_.isEmpty(keyStatus)) filter.status = { $in: _.keys(keyStatus).map(k => _.toNumber(k)) };
// 	}
// 	if (addId) {
// 		const selectedHydrants = getSelectedHydrants();
// 		if (!_.isEmpty(selectedHydrants)) filter._id = { $in: selectedHydrants };
// 	}
// 	return filter;
// }
//
// export function getEventsBackendFilterParams() {
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
// 	return filterE;
// }
//














// const newFilterH = filterH.map((value, key) => ({ [`h.${key}`]: value }) );

//
// hydrantSelected: {
// 	type: Array,
// 		optional: true,
// 		label: 'Selected hydrant ids',
// },
// 'hydrantSelected.$': String,

// selectRowProp: {
// 	mode: 'checkbox',
// 		clickToSelect: true,
// 		bgColor: 'green',
// },

// withHandlers({
// 	setSelected: () => (row, isSelected) => {
// 		setSelectedHydrants(row._id, isSelected);
// 	},
// 	setAllSelected: () => (isSelected, rows) => {
// 		setSelectedHydrants(rows.map(el => el._id), isSelected);
// 	},
// }),

// selectRow={
// 	mode: 'checkbox',
// 	clickToSelect: true,
// 	bgColor: 'green',
// }
// onSelect: p.setSelected,
// onSelectAll: p.setAllSelected,
// selected: resetSelected(getSelectedHydrants().filter(id => p.data.find(row => row._id === id))),
// options={{
// 	onRowClick: p.click,
// }}


// export function getSelectedHydrants() {
// 	return _.get(StorageCollection.findOne(), 'hydrantSelected', []);
// }
//
// export function setSelectedHydrants(ids, isSelected) {
// 	let current = getSelectedHydrants();
//
// 	current = isSelected ?
// 		_.uniq(_.concat(current, ids))
// 		: _.difference(current, _.castArray(ids));
//
// 	StorageCollection.upsert(1, { $set: { hydrantSelected: current } });
// }
//
// export function resetSelected(s) {
// 	if (s) StorageCollection.upsert(1, { $set: { hydrantSelected: s } });
// 	return s;
// }


// function mongoDateBack(keyDate) {
// 	const dateOffset = (24 * 60 * 60 * 1000);
// 	let now = (new Date()).getTime();
// 	now = 10000000 * Math.round(now / 10000000);
// 	const past = new Date();
// 	switch (keyDate) {
// 		case 0:
// 			past.setTime(now - (dateOffset * 1));
// 			break;
// 		case 1:
// 			past.setTime(now - (dateOffset * 7));
// 			break;
// 		case 2:
// 			past.setTime(now - (dateOffset * 30));
// 			break;
// 		case 3:
// 			past.setTime(now - (dateOffset * 121));
// 			break;
// 		case 4:
// 			past.setTime(now - (dateOffset * 365));
// 			break;
// 		default:
// 			past.setTime(0);
// 	}
// 	// return { $gt: past.toISOString() };
// 	let choose = {
// 		0: 1, 1: 7, 2: 30, 3: 90, 4: 365
// 	};
// 	return { $gt: moment().subtract(choose[keyDate], 'days').toISOString() };
// }


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
