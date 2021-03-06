import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import moment from 'moment';
import Hydrants from '../Collections/Hydrants';
import rateLimit from '../../Utils/rate-limit';
import * as roles from '../../Utils/roles';

function buildFilter(fromFilter) {
	const filter = {};

	if (roles.isUserControl()) {
		filter.companyId = Meteor.user().companyId;
		filter.enabled = true;
	}
	if (fromFilter) {
		if (fromFilter._id) {
			filter._id = fromFilter._id;
		}
		if (fromFilter.number) {
			filter.numberStringified = { $regex: `^${fromFilter.number}` };
		}
		if (fromFilter.address) {
			filter.address = { $regex: `${fromFilter.address}` };
		}
		if (fromFilter.description) {
			filter.description = { $regex: `${fromFilter.description}` };
		}
		if (fromFilter.createdAt) {
			const choose = { 0: 1, 1: 7, 2: 30, 3: 90, 4: 365 };
			filter.createdAt = { $gt: moment().subtract(choose[fromFilter.createdAt] || 10000, 'days').toDate() };
		}
		if (!_.isEmpty(fromFilter.status)) {
			filter.status = { $in: _.keys(fromFilter.status).map(k => _.toNumber(k)) };
		}
	}
	return filter;
}

Meteor.methods({
	'hydrants.get.total.counts': function anon() {
		if (!roles.isUserAdminOrControl()) return undefined;
		const arrayEnabled = Hydrants.aggregate([
			{ $match: _.assign({}, buildFilter(), { enabled: true }) },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		const cntEnabledUnits = _.get(arrayEnabled, '[0].count', 0);

		if (roles.isUserControl()) {
			return { cntTotalUnits: cntEnabledUnits };
		} else if (roles.isUserAdmin()) {
			const arrayDisabled = Hydrants.aggregate([
				{ $match: _.assign({}, buildFilter(), { enabled: false }) },
				{ $group: {
					_id: null,
					count: { $sum: 1 }
				} },
			]);
			const cntDisabledUnits = _.get(arrayDisabled, '[0].count', 0);
			return {
				cntEnabledUnits,
				cntDisabledUnits,
				cntTotalUnits: cntEnabledUnits + cntDisabledUnits,
			};
		}
		return undefined;
	},
	'hydrants.get.lenQuery': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return undefined;
		const { filter } = p;
		const array = Hydrants.aggregate([
			{ $project: {
				createdAt: 1,
				numberStringified: { $toLower: '$number' },
				status: 1,
				address: 1,
				description: 1,
				companyId: 1,
				enabled: 1,
			} },
			{ $match: buildFilter(filter) },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		return _.get(array, '[0].count', 0);
	},
	'hydrants.get.data': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return undefined;
		const { filter, sort, skip } = p;
		return Hydrants.aggregate([
			{ $project: {
				createdAt: 1,
				numberStringified: { $toLower: '$number' },
				number: 1,
				status: 1,
				address: 1,
				description: 1,
				companyId: 1,
				enabled: 1,
			} },
			{ $match: buildFilter(filter) },
			{ $sort: { [sort.name]: sort.order } },
			{ $skip: skip },
			{ $limit: 14 },
		], { allowDiskUse: true });
	},
	'hydrants.get.data.one': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return undefined;
		const { filter } = p;
		return Hydrants.findOne(buildFilter(filter));
	},
	'hydrants.zero.status': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return;
		const { _id } = p;
		Hydrants.update(_id, { $set: { status: 0 } });
	},
});

Meteor.methods({
	'hydrants.insert': function anon(doc) {
		check(doc, Object);
		if (!roles.isUserAdmin()) return undefined;
		console.log('inserting');
		try {
			return Hydrants.insert({ ...doc });
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.update': function anon(doc) {
		check(doc, Object);
		if (!roles.isUserAdmin()) return undefined;
		console.log('updating');
		try {
			const _id = doc._id;
			Hydrants.update(_id, { $set: doc });
			return _id; // Return _id so we can redirect to document after update.
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.remove': function anon(_id) {
		check(_id, String);
		if (!roles.isUserAdmin()) return undefined;
		try {
			return Hydrants.remove(_id);
		} catch (exception) {
			throw new Meteor.Error('500', exception);
		}
	},
});

rateLimit({
	methods: [
		'hydrants.zero.status', 'hydrants.get.total.counts', 'hydrants.get.lenQuery', 'hydrants.get.data', 'hydrants.get.data.one',
		'hydrants.insert', 'hydrants.update', 'hydrants.remove'
	],
	limit: 10,
	timeRange: 1000,
});
