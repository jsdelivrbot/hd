import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import Events from './Events';
import Static from '../Utility/Static';
import rateLimit from '../../modules/rate-limit';

// import moment from 'moment';
// function mongoDateBack(keyDate) {
// 	const choose = { 0: 1, 1: 7, 2: 30, 3: 90, 4: 365 };
// 	return { $gt: moment().subtract(choose[keyDate] || 10000, 'days').toISOString() };
// }

function buildQueryParams(filter, sort) {
	const filter = {};
	const keyDateE = getEventFilter().createdAt;
	const keyCode = getEventFilter().code;

	filterE.createdAt = mongoDateBack(keyDateE);

	if (!_.isEmpty(keyCode)) {
		filterE.code = { $in: _.keys(keyCode).map(k => _.toNumber(k)) };
	}

	return filterE;
}


Meteor.methods({
	'events.get.init': function getEventsH(p) {
		check(p, Object);
		return {
			types: Static.findOne({}).types,
			countHuntUnits: _.get(Events.aggregate([
				{ $match: { code: 2 } },
				{ $group: {
					_id: null,
					count: { $sum: 1 }
				} },
			]), '[0].count', 0)
		};
	},
	'events.get.lenQuery': function getEventsH(p) {
		check(p, Object);
		const { filter } = p;
		return {
			lenQuery: _.get(Events.aggregate([
				{ $match: filter },
				{ $group: {
					_id: null,
					count: { $sum: 1 }
				} },
			]), '[0].count', 0)
		};
	},
	'events.get.data': function getEventsH(p) {
		check(p, Object);
		const { filter, sort, skip } = p;

		return {
			data: Events.aggregate([
				{ $match: filter },
				{ $sort: sort },
				{ $skip: skip },
				{ $limit: 12 },
				{ $lookup: {
					from: 'Hydrants',
					localField: 'hydrantId',
					foreignField: '_id',
					as: 'h'
				} },
				{ $unwind: '$h' },
				{ $project: {
					createdAt: 1,
					number: 1,
					code: 1,
					edata: 1,
					hydrantNumber: '$h.number',
					description: '$h.description',
				} }]) }; },
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


