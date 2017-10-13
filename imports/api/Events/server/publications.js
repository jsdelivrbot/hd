/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';
import Events from '../Events';

Meteor.publish('events', function events() {
	return Events.find();
});

Meteor.publish('eventsH', function eventsH({ filter, sort }) {
	ReactiveAggregate(
		this,
		Events,
		[
			{
				$lookup: {
					from: 'Hydrants',
					localField: 'hydrantId',
					foreignField: '_id',
					as: 'h'
				}
			},
			{ $unwind: '$h' },
			{ $match: { filter } },
			{ $sort: { sort } },
		],
		{ clientCollection: 'EventsH' });
});
