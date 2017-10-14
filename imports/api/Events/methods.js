import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Events from './Events';
import rateLimit from '../../modules/rate-limit';


Meteor.methods({
	'getEventsHCount': function(p) {
		check(p, Object);
		const { filterH, filterE, sort } = p;

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
	}
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
