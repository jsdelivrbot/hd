import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import initDb from '../../../startup/server/fixtures';
import rateLimit from '../../Utils/rate-limit';
import Static from '../Collections/Static';
import * as roles from '../../Utils/roles';

Meteor.methods({
	'utility.get.types': function anon() {
		if (!roles.isUserAdminOrControl()) return undefined;
		return Static.findOne({}).types;
	},
	'utility.db.init': function anon() {
		if (!roles.isUserAdmin()) return;
		console.log('clearing database');
		try {
			console.log('init');
			initDb();
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
});

rateLimit({
	methods: [
		'utility.get.types', 'utility.db.init', 'utility.getPage'
	],
	limit: 2,
	timeRange: 1000,
});
