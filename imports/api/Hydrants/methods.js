import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Hydrants from './Hydrants';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
	'hydrants.insert': function hydrantsInsert(doc) {
		check(doc, Match.Any);
		console.log('inserting');
		try {
			console.log('ok');
			return Hydrants.insert({ ...doc });
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.update': function hydrantsUpdate(doc) {
		check(doc, Match.Any);
		try {
			const hydrantId = doc._id;
			Hydrants.update(hydrantId, { $set: doc });
			return hydrantId; // Return _id so we can redirect to document after update.
		} catch (exception) {
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.remove': function hydrantsRemove(hydrantId) {
		check(hydrantId, Match.Any);
		try {
			return Hydrants.remove(hydrantId);
		} catch (exception) {
			throw new Meteor.Error('500', exception);
		}
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
