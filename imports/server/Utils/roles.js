import _ from 'lodash';
import { Meteor } from 'meteor/meteor';

const isUserAdmin = () => Meteor.userId() && (Meteor.user().role == 0);
const isUserControl = () => Meteor.userId() && (Meteor.user().role == 1);
const isUserAdminOrControl = () => Meteor.userId() && (Meteor.user().role == 0 || Meteor.user().role == 1);
const isUserAdminOrControlOrSecurity = (userId) => {
	let role;
	if (userId) {
		role = _.get(Meteor.users.findOne(userId), 'role', false);
	} else {
		role = Meteor.userId() && Meteor.user().role;
	}
	return role == 0 || role == 1 || role == 2;
};

export { isUserAdmin, isUserControl, isUserAdminOrControl, isUserAdminOrControlOrSecurity };
