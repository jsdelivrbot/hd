import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Events from './Events';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
	'events.insert': function eventsInsert(doc) {
		check(doc, Match.Any);
		console.log('inserting');
		try {
			console.log('ok');
			return Events.insert({ ...doc });
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
});

rateLimit({
	methods: [
		'events.insert',
		'events.remove',
	],
	limit: 5,
	timeRange: 1000,
});
