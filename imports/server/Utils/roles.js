import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { getCustomDeviceId } from './utils';

const isUserAdmin = () => Meteor.userId() && (Meteor.user().role == 0);
const isUserControl = () => Meteor.userId() && (Meteor.user().role == 1);
const isUserAdminOrSecurity = ({ flag, userId, deviceInfo }) => {
	const customDeviceId = getCustomDeviceId({ deviceInfo });
	let user;
	if (userId && customDeviceId) {
		user = Meteor.users.findOne({ $and: [{ userId }, { customDeviceId: { $elemMatch: { customDeviceId } } }] });
	} else {
		user = Meteor.user();
	}
	const role = _.get(user, 'role', false);
	return role == 0 || role == 2;
};
const isUserAdminOrControl = () => {
	const user = Meteor.user();
	const role = _.get(user, 'role', false);
	return role == 0 || role == 1;
};
const isUserAdminOrControlOrSecurity = ({ flag, userId, deviceInfo }) => {
	const customDeviceId = getCustomDeviceId({ deviceInfo });
	let user;
	if (userId && customDeviceId) {
		user = Meteor.users.findOne({ $and: [{ userId }, { customDeviceId: { $elemMatch: { customDeviceId } } }] });
	} else {
		user = Meteor.user();
	}
	const role = _.get(user, 'role', false);
	return role == 0 || role == 1 || role == 2;
};

export { isUserAdmin, isUserControl, isUserAdminOrSecurity, isUserAdminOrControlOrSecurity, isUserAdminOrControl };
