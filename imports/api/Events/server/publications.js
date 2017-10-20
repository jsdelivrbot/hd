/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';
import { check } from 'meteor/check';
import _ from 'lodash';
import Events from './Events';

Meteor.publish('eventsH', function eventsH(p) {
	check(p, Object);
	const { filterH, filterE, sort, limit, skip } = p;

	console.log('filterH');
	console.log(filterH);
	console.log('filterE');
	console.log(filterE);
	console.log('sort');
	console.log(sort);
	const newFilterH = _.transform(filterH, function(result, value, key) {
		result[`h.${key}`] = value;
	}, {});
	console.log('new filterH');
	console.log(filterH);

	ReactiveAggregate(
		this,
		Events,
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
		],
		{ clientCollection: 'EventsH' }
	);
});

// Meteor.publish('eventsHCount', function eventsHCount(p) {
// 	check(p, Object);
// 	const { filterH, filterE, sort } = p;
//
// 	console.log('filterH');
// 	console.log(filterH);
// 	console.log('filterE');
// 	console.log(filterE);
// 	console.log('sort');
// 	console.log(sort);
// 	const newFilterH = _.transform(filterH, function(result, value, key) {
// 		result[`h.${key}`] = value;
// 	}, {});
// 	console.log('new filterH');
// 	console.log(filterH);
//
// 	ReactiveAggregate(
// 		this,
// 		Events,
// 		[
// 			{ $match: filterE },
// 			{ $lookup: {
// 				from: 'Hydrants',
// 				localField: 'hydrantId',
// 				foreignField: '_id',
// 				as: 'h'
// 			} },
// 			{ $unwind: '$h' },
// 			{ $match: newFilterH },
// 			{ $project: {
// 				createdAt: 1,
// 				number: 1,
// 				code: 1,
// 				edata: 1,
// 				hydrantNumber: '$h.number',
// 				description: '$h.description',
// 			} },
// 			{ $group: {
// 				_id: null,
// 				count: { $sum: 1 }
// 			} },
// 		],
// 		{ clientCollection: 'EventsHCount' }
// 	);
// });
