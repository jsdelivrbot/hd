import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import getPrivateFile from '../../../modules/server/get-private-file';
import parseMarkdown from '../../../modules/parse-markdown';
import initDb from '../../../startup/server/fixtures';
import rateLimit from '../../../modules/server/rate-limit';

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
	'utility.getPage': function utilityGetPage(fileName) {
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
