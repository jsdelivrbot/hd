import { Meteor } from 'meteor/meteor';
import sendEmail from '../../Utils/send-email';
import getOAuthProfile from '../../../modules/get-oauth-profile';

export default (options, user) => {
	const OAuthProfile = getOAuthProfile(options, user);

	const applicationName = Meteor.settings.private.APPLICATION_NAME;
	const firstName = OAuthProfile ? OAuthProfile.name.first : options.profile.name.first;
	const emailAddress = OAuthProfile ? OAuthProfile.email : options.email;

	return sendEmail({
		to: emailAddress,
		from: `${applicationName} <support@application.com>`,
		subject: `[${applicationName}] Welcome, ${firstName}!`,
		template: 'welcome',
		templateVars: {
			applicationName,
			firstName,
			welcomeUrl: Meteor.absoluteUrl('hydrants'), // e.g., returns http://localhost:3000/hydrants
		},
	})
		.catch((error) => {
			throw new Meteor.Error('500', `${error}`);
		});
};
