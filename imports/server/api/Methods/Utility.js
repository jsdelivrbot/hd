import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import getPrivateFile from '../../../modules/server/get-private-file';
import parseMarkdown from '../../../modules/parse-markdown';
import initDb from '../../../startup/server/fixtures';
import rateLimit from '../../../modules/server/rate-limit';
import Static from '../Collections/Static';
import * as roles from '../../../modules/server/roles';

Meteor.methods({
	'utility.get.types': function anon() {
		if (!roles.isUserAdminOrControl()) return undefined;
		return Static.findOne({}).types;
	},
	'db.init': function anon() {
		if (!roles.isUserAdmin()) return undefined;
		console.log('clearing database');
		try {
			console.log('init');
			initDb();
			return undefined;
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'utility.getPage': function anon(fileName) {
		check(fileName, String);
		return parseMarkdown(getPrivateFile(`pages/${fileName}.md`));
	},
});

rateLimit({
	methods: [
		'utility.get.types', 'db.init', 'utility.getPage'
	],
	limit: 2,
	timeRange: 1000,
});
