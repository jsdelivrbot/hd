import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import getPrivateFile from '../../../server/Utils/get-private-file';
import templateToHTML from '../../../server/Utils/handlebars-email-to-html';
import templateToText from '../../../server/Utils/handlebars-email-to-text';

const name = 'Application Name';
const email = '<support@application.com>';
const from = `${name} ${email}`;
const emailTemplates = Accounts.emailTemplates;

emailTemplates.siteName = name;
emailTemplates.from = from;
emailTemplates.verifyEmail = {
	subject() {
		return `[${name}] Verify Your Email Address`;
	},
	html(user, url) {
		return templateToHTML(getPrivateFile('email-templates/verify-email.html'), {
			applicationName: name,
			firstName: user.profile.name.first,
			verifyUrl: `www.${url.replace('#/', '')}`
		});
	},
	text(user, url) {
		const urlWithoutHash = `www.${url.replace('#/', '')}`;
		if (Meteor.isDevelopment) console.info(`Verify Email Link: ${urlWithoutHash}`); // eslint-disable-line
		return templateToText(getPrivateFile('email-templates/verify-email.txt'), {
			applicationName: name,
			firstName: user.profile.name.first,
			verifyUrl: urlWithoutHash,
		});
	},
};

emailTemplates.resetPassword = {
	subject() {
		return `[${name}] אפס את סיסמתך`;
	},
	html(user, url) {
		return templateToHTML(getPrivateFile('email-templates/reset-password.html'), {
			firstName: user.profile.name.first,
			applicationName: name,
			emailAddress: user.emails[0].address,
			resetUrl: `www.${url.replace('#/', '')}`,
		});
	},
	text(user, url) {
		const urlWithoutHash = `www.${url.replace('#/', '')}`;
		if (Meteor.isDevelopment) console.info(`Reset Password Link: ${urlWithoutHash}`); // eslint-disable-line
		return templateToText(getPrivateFile('email-templates/reset-password.txt'), {
			firstName: user.profile.name.first,
			applicationName: name,
			emailAddress: user.emails[0].address,
			resetUrl: urlWithoutHash,
		});
	},
};

emailTemplates.enrollAccount = {
	subject() {
		return `[${name}] אפס את סיסמתך`;
	},
	html(user, url) {
		let newUrl = url.replace('#/', '');
		if (newUrl.search('localhost') < 0) newUrl = newUrl.replace('http://', 'http://www.');
		console.log(newUrl);
		return templateToHTML(getPrivateFile('email-templates/reset-password.html'), {
			firstName: user.profile.name.first,
			applicationName: name,
			emailAddress: user.emails[0].address,
			resetUrl: newUrl,
		});
	},
	text(user, url) {
		let newUrl = url.replace('#/', '');
		if (newUrl.search('localhost') < 0) newUrl = newUrl.replace('http://', 'http://www.');
		const urlWithoutHash = newUrl;
		if (Meteor.isDevelopment) console.info(`Reset Password Link: ${urlWithoutHash}`); // eslint-disable-line
		return templateToText(getPrivateFile('email-templates/reset-password.txt'), {
			firstName: user.profile.name.first,
			applicationName: name,
			emailAddress: user.emails[0].address,
			resetUrl: urlWithoutHash,
		});
	},
};
