import _ from 'lodash';
import { Meteor } from 'meteor/meteor';

const isUserAdmin = () => Meteor.userId() && (Meteor.user().role == 0);
const isUserControl = () => Meteor.userId() && (Meteor.user().role == 1);
const isUserAdminOrControl = () => Meteor.userId() && (Meteor.user().role == 0 || Meteor.user().role == 1);
const isUserAdminOrControlOrSecurity = (email) => {
	let role;
	if (email) {
		role = _.get(Meteor.users.findOne({ 'emails.0.address': email }), 'role', false);
	} else {
		role = Meteor.userId() && Meteor.user().role;
	}
	return role == 0 || role == 1 || role == 2;
};

export { isUserAdmin, isUserControl, isUserAdminOrControl, isUserAdminOrControlOrSecurity };
