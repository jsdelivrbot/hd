import { Meteor } from 'meteor/meteor';
import rateLimit from '../../modules/rate-limit';
import initDb from '../../startup/server/fixtures';

Meteor.methods({
	'db.init': function fixture() {
		console.log('clearing database');
		try {
			console.log('ok');
			initDb();
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
});

rateLimit({
	methods: [
		'fixture',
	],
	limit: 1,
	timeRange: 1000,
});
