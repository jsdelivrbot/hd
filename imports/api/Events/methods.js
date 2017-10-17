import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Events from './Events';
import rateLimit from '../../modules/rate-limit';
import _ from 'lodash';

Meteor.methods({
	getEventsH: function getEventsH(p) {
		check(p, Object);
		const { filterE, sort, skip, doCalculateQueryLen, doCalculateOnce } = p;

		const queryLen = doCalculateQueryLen && _.get(Events.aggregate([
			{ $match: filterE },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]), '[0].count', 0);

		const huntUnitsCount = doCalculateOnce && _.get(Events.aggregate([
			{ $match: { code: 2 } },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]), '[0].count', 0);

		const data = Events.aggregate(
			[
				{ $match: filterE },
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
				} },
			]
		);

		return { huntUnitsCount, queryLen, data };
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


// const newFilterH = filterH.map((value, key) => ({ [`h.${key}`]: value }) );
