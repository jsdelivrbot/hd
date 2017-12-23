import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import fp from 'lodash/fp';
import moment from 'moment';
import Events from '../Collections/Events';
import Hydrants from '../Collections/Hydrants';
import Static from '../Collections/Static';
import rateLimit from '../../Utils/rate-limit';
import * as roles from '../../Utils/roles';
import Messages from "../Collections/Messages";

function buildFilterEvents(fromFilter) {
	const filter = {};

	if (fromFilter.createdAt) {
		const choose = { 0: 1, 1: 7, 2: 30, 3: 90, 4: 365 };
		filter.createdAt = { $gt: moment().subtract(choose[fromFilter.createdAt] || 10000, 'days').toDate() };
	}

	if (!_.isEmpty(fromFilter.code)) {
		filter.code = { $in: _.keys(fromFilter.code).map(k => _.toNumber(k)) };
	}

	if (fromFilter.hydrantId) {
		filter.hydrantId = fromFilter.hydrantId;
	}
	return filter;
}

function buildFilterHydrants() {
	const filter = {};
	if (roles.isUserControl()) {
		filter['h.companyId'] = Meteor.user().companyId;
		filter['h.enabled'] = true;
	}
	return filter;
}

Meteor.methods({
	'events.get.counts': function anon() {
		if (!roles.isUserAdminOrControl()) return undefined;
		const array = Events.aggregate([
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $match: buildFilterHydrants() },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		], { allowDiskUse: true });
		return { cntAllUnits: _.get(array, '[0].count', 0) };
	},
	'events.get.lenQuery': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return undefined;
		const { filter } = p;
		const array = Events.aggregate([
			{ $match: buildFilterEvents(filter) },
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $match: buildFilterHydrants() },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		], { allowDiskUse: true });
		return _.get(array, '[0].count', 0);
	},
	'events.get.data': function anon(p) {
		check(p, Object);
		if (!roles.isUserAdminOrControl()) return undefined;
		const { filter, sort, skip } = p;

		return Events.aggregate([
			{ $match: buildFilterEvents(filter) },
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $match: buildFilterHydrants() },
			{ $project: {
				createdAt: 1,
				code: 1,
				edata: 1,
				hydrantNumber: '$h.number',
				description: '$h.description',
			} },
			{ $sort: { [sort.name]: sort.order } },
			{ $skip: skip },
			{ $limit: 12 },
		], { allowDiskUse: true });
	},
	'events.get.mobile': function anon(p) {
		check(p, Object);
		console.log('p.createdAt');
		console.log(p.createdAt);
		console.log('p.companyId');
		console.log(p.companyId);

		let data = Events.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $match: { createdAt: { $gt: new Date(p.createdAt) } } },
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $match: { 'h.companyId': p.companyId } },
			{ $project: {
				createdAt: 1,
				eventId: '$_id',
				_id: 0,
				code: 1,
				edata: 1,
				hydrantNumber: '$h.number',
				lat: '$h.lat',
				lon: '$h.lon',
				address: '$h.address',
			} },
		], { allowDiskUse: true });

		const ecodes = Static.findOne({}).types.code;
		data = data.map(({ code, createdAt, ...rest }) => ({
			createdAt: createdAt.toISOString(),
			codeText: ecodes[code],
			code,
			...rest
		}));
		console.log('events data.length');
		console.log(data.length);
		return data;
	},
});

rateLimit({
	methods: [
		'events.get.mobile', 'events.get.data', 'events.get.lenQuery', 'events.get.counts'
	],
	limit: 2,
	timeRange: 1000,
});




//construct a Promise that will take 2500ms to resolve
// console.log("began running")
// let promise = new Promise((resolve)=>
// 	setTimeout(()=>{
// 		console.log("done running")
// 		resolve("I'm baaaack....")}, 2500))
// return Promise.await(promise);
