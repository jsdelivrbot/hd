/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';
import { check } from 'meteor/check';
import Events from '../Events';
import _ from 'lodash';

// Meteor.publish('events', function events() {
// 	return Events.find();
// });
//
// Meteor.publish('eventsH', function eventsH(p) {
// 	check(p, Object);
// 	const { filterH, filterE, sort } = p;
// 	console.log('filterH');
// 	console.log(filterH);
// 	console.log('filterE');
// 	console.log(filterE);
// 	console.log('sort');
// 	console.log(sort);
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
// 			{ $match: {
// 				'h.createdAt': { '$gt': '1970-01-01T00:00:00.000Z' },
// 			} },
// 			{ $project: {
// 				createdAt: 1,
// 				number: 1,
// 				code: 1,
// 				edata: 1,
// 				hydrantNumber: '$h.number',
// 				description: '$h.description',
// 			} },
// 			{ $sort: { date: 1 } },
// 			// { $group: {
// 			// 	_id: 'null',
// 			// 	hydrantNumber: { $sum: 1 },
// 			// } },
// 		],
// 		{ clientCollection: 'EventsH' });
// });
