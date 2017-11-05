import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import _ from 'lodash';
import moment from 'moment';
import Hydrants from './Hydrants';
import rateLimit from '../../../modules/server/rate-limit';

function buildFilter(fromfilter) {
	const filter = {};
	console.log('hydrants uploading');

	const choose = { 0: 1, 1: 7, 2: 30, 3: 90, 4: 365 };
	filter.createdAt = { $gt: moment().subtract(choose[fromfilter.createdAt] || 10000, 'days').toISOString() };

	if (!_.isEmpty(fromfilter.status)) {
		filter.status = { $in: _.keys(fromfilter.status).map(k => _.toNumber(k)) };
	}

	return filter;
}

Meteor.methods({
	'hydrants.get.init': function getEventsH() {
		const arrayEnabled = Hydrants.aggregate([
			{ $match: { enabled: true } },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		const arrayDisabled = Hydrants.aggregate([
			{ $match: { enabled: false } },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		const cntEnabledUnits = _.get(arrayEnabled, '[0].count', 0);
		const cntDisabledUnits = _.get(arrayDisabled, '[0].count', 0);
		return {
			cntEnabledUnits,
			cntDisabledUnits,
			cntTotalUnits: cntEnabledUnits + cntDisabledUnits,
		};
	},
	'hydrants.get.lenQuery': function getHydrantsH(p) {
		check(p, Object);
		const { filter } = p;
		const array = Hydrants.aggregate([
			{ $match: buildFilter(filter) },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		return _.get(array, '[0].count', 0);
	},
	'hydrants.get.data': function getHydrantsH(p) {
		check(p, Object);
		const { filter, sort, skip } = p;

		return Hydrants.aggregate([
			{ $match: buildFilter(filter) },
			{ $sort: { [sort.name]: sort.order } },
			{ $skip: skip },
			{ $limit: 12 },
			{ $project: {
				createdAt: 1,
				number: 1,
				status: 1,
				address: 1,
				description: 1,
			} }], { allowDiskUse: true });
	},
	'hydrants.get.data.one': function getHydrantsH(p) {
		check(p, Object);
		const { filter } = p;
		console.log('filter');
		console.log(filter);
		return Hydrants.findOne({ _id: filter._id });
	},
});

Meteor.methods({
	'map.get.init': function mapGetInit() {
		console.log('init map');
		const array = Hydrants.aggregate([
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		return _.get(array, '[0].count', 0);
	},
	'map.get.data': function mapGetData(p) {
		check(p, Object);
		const { bounds, hydrantId } = p;
		console.log('getting map in bounds');
		console.log(bounds);
		const { east, west, north, south } = bounds;
		const result = Hydrants.aggregate([
			{ $match: { $and: [{ _id: hydrantId || { $exists: true }, lat: { $gt: south, $lt: north } }, { lon: { $gt: west, $lt: east } }] } },
			{ $limit: 40 },
			{ $project: {
				lat: 1,
				lon: 1,
				status: 1,
				address: 1,
				number: 1,
			} }]);
		console.log('finished');
		return result;
	},
});

Meteor.methods({
	'hydrants.insert': function hydrantsInsert(doc) {
		check(doc, Match.Any);
		console.log('inserting');
		try {
			console.log('ok');
			return Hydrants.insert({ ...doc });
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.update': function hydrantsUpdate(doc) {
		check(doc, Match.Any);
		console.log('updating');
		try {
			console.log('ok');
			const hydrantId = doc._id;
			Hydrants.update(hydrantId, { $set: doc });
			return hydrantId; // Return _id so we can redirect to document after update.
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.remove': function hydrantsRemove(hydrantId) {
		check(hydrantId, Match.Any);
		try {
			return Hydrants.remove(hydrantId);
		} catch (exception) {
			throw new Meteor.Error('500', exception);
		}
	},
});

rateLimit({
	methods: [
		'hydrants.insert',
		'hydrants.update',
		'hydrants.remove',
	],
	limit: 5,
	timeRange: 1000,
});
