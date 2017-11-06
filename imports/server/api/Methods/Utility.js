import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import getPrivateFile from '../../../modules/server/get-private-file';
import parseMarkdown from '../../../modules/parse-markdown';
import initDb from '../../../startup/server/fixtures';
import rateLimit from '../../../modules/server/rate-limit';
import Static from '../Collections/Static';

Meteor.methods({
	'get.types': function anon() {
		return Static.findOne({}).types;
	},
	'db.init': function anon() {
		console.log('clearing database');
		try {
			console.log('ok');
			initDb();
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
		'fixture',
	],
	limit: 1,
	timeRange: 1000,
});
