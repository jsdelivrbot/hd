import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import moment from 'moment';
import Hydrants from '../Collections/Hydrants';
import rateLimit from '../../Utils/rate-limit';
import * as roles from '../../Utils/roles';
import { sleep, isNumeric } from '../../Utils/utils';

function buildFilter(fromFilter) {
	const filter = {};

	if (roles.isUserControl()) {
		filter.companyId = Meteor.user().companyId;
		filter.enabled = true;
	}
	filter.lat = { $ne: null };
	filter.lat = { $gt: 0 };
	filter.lon = { $ne: null };
	filter.lon = { $gt: 0 };
	return _.assign({}, filter, fromFilter);
}

Meteor.methods({
	'map.get.counts': function anon() {
		if (!roles.isUserAdminOrControl()) return undefined;

		const array_cntAllUnits = Hydrants.aggregate([
			{ $match: buildFilter() },
			{ $group: {
				_id: null,
				sum: { $sum: 1 },
				south: { $min: '$lat' },
				north: { $max: '$lat' },
				west: { $min: '$lon' },
				east: { $max: '$lon' },
			} },
		]);
		let cntAllUnits = 0;
		if (array_cntAllUnits.length >= 1) cntAllUnits = array_cntAllUnits[0];
		
		const array_cntTroubledUnits = Hydrants.aggregate([
			{ $match: buildFilter({ status: { $gt: 2 } }) },
			{ $group: {
				_id: null,
				sum: { $sum: 1 },
				south: { $min: '$lat' },
				north: { $max: '$lat' },
				west: { $min: '$lon' },
				east: { $max: '$lon' },
			} },
		]);
		let cntTroubledUnits = 0;
		if (array_cntTroubledUnits.length >= 1) cntTroubledUnits = array_cntTroubledUnits[0];
		return { cntAllUnits, cntTroubledUnits };
	},
	'map.get.data': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return undefined;
		const { bounds, filterStatus } = p;
		const { east, west, north, south } = bounds;
		const result = Hydrants.aggregate([
			{ $match: buildFilter({
				status: (filterStatus && { $gt: 2 }) || { $exists: true },
				lat: { $gt: south, $lt: north },
				lon: { $gt: west, $lt: east },
			}) },
			{ $sample: { size: 60 } },
			{ $project: {
				lat: 1,
				lon: 1,
				status: 1,
				address: 1,
				number: 1,
			} }]);
		return result;
	},
	'map.get.data.one': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return undefined;
		const { _id } = p;
		const result = Hydrants.aggregate([
			{ $match: buildFilter(_id) },
			{ $project: {
				lat: 1,
				lon: 1,
				status: 1,
				address: 1,
				number: 1,
			} }]);
		return result;
	},
});

rateLimit({
	methods: [
		'map.get.data', 'map.get.counts', 'map.get.data.one'
	],
	limit: 10,
	timeRange: 1000,
});
