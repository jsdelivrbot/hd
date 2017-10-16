import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Events from './Events';
import rateLimit from '../../modules/rate-limit';


Meteor.methods({
	'getEventsHCount': function(p) {
		check(p, Object);
		const { filterH, filterE } = p;

		return Events.aggregate([
			{ $match: filterE },
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $match: filterH },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
	},
	'getEventsH': function(p) {
		check(p, Object);
		const { filterH, filterE, sort } = p;
		const newFilterH = _.transform(filterH, function(result, value, key) {
			result[`h.${key}`] = value;
		}, {});

		return Events.aggregate(
			[
				{ $match: filterE },
				{ $lookup: {
					from: 'Hydrants',
					localField: 'hydrantId',
					foreignField: '_id',
					as: 'h'
				} },
				{ $unwind: '$h' },
				{ $match: newFilterH },
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
