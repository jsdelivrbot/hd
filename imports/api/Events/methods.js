import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Events from './Events';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
	getEventsH: function getEventsH(p) {
		check(p, Object);
		const { filterE, sort, limit, skip, doCalculateQueryLen, doCalculateOnce } = p;

		// console.log('doCalculateQueryLen');
		// console.log(doCalculateQueryLen);
		// console.log('doCalculateOnce');
		// console.log(doCalculateOnce);

		const queryLen = doCalculateQueryLen && Events.aggregate([
			{ $match: filterE },
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		])[0].count;

		const huntUnitsCount = doCalculateOnce && Events.aggregate([
			{ $match: { code: 2 } },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		])[0].count;
		// console.log('huntUnitsCount');
		// console.log(huntUnitsCount);
		// console.log('queryLen');
		// console.log(queryLen);

		const data = Events.aggregate(
			[
				{ $match: filterE },
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
				{ $sort: sort },
				{ $skip: skip },
				{ $limit: limit },
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
