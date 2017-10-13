/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';
import { check } from 'meteor/check';
import Events from '../Events';
import _ from 'lodash';

Meteor.publish('events', function events() {
	return Events.find();
});

// Meteor.publish('eventsH', function eventsH() {
Meteor.publish('eventsH', function eventsH(p) {
	check(p, Object);
	const { filterH, filterE, sort } = p;
	console.log(filterE);
	// console.log("{ createdAt: { '$gt': '2017-08-14T13:21:40.000Z' } }");
	// const xx = { $match: { createdAt: { '$gt': '2017-08-14T13:21:40.000Z' } } };
	// const ff = { createdAt: { '$gt': '2017-08-14T13:21:40.000Z' } };
	// const yy = { $match: _.cloneDeep(filterE) };

	// console.log(xx);
	// console.log(yy);

	ReactiveAggregate(
		this,
		Events,
		[
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			// { $match: {
			// 	h: filterH,
			// 	filterE
			// } },
			{ $project: {
				createdAt: 1,
				number: 1,
				code: 1,
				edata: 1,
				hydrantNumber: '$h.number',
				description: '$h.description',
			} },
			{ $match: filterE },
			{ $sort: { date: 1 } },
			{ $group: {
				_id: 'null',
				hydrantNumber: { $sum: 1 },
			} },
		],
		{ clientCollection: 'EventsH' });
});
