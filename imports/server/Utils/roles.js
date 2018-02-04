import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { getCustomDeviceId } from './utils';

function getRole(props) {
	const mobileUser = _.get(props, 'user');
	const deviceInfo = _.get(props, 'deviceInfo');
	if (mobileUser && deviceInfo) {
		const { userId } = mobileUser;
		const customDeviceId = getCustomDeviceId({ deviceInfo });
		if (userId && customDeviceId) {
			const user = Meteor.users.findOne({ $and: [{ userId }, { customDeviceId: { $elemMatch: { customDeviceId } } }] });
			return _.get(user, 'role', false);
		}
	}
	return _.get(Meteor.user(), 'role', false);
}
const isUserControl = () => Meteor.userId() && (Meteor.user().role == 1);
const isUserAdmin = props => getRole(props) == 0;
const isUserAdminOrSecurity = props => getRole(props) == 0 || getRole(props) == 2;
const isUserAdminOrControl = props => getRole(props) == 0 || getRole(props) == 1;
const isUserAdminOrControlOrSecurity = props => getRole(props) == 0 || getRole(props) == 1 || getRole(props) == 2;
const userRoleAsString = (role) => {
	if (role == 0) return 'admin';
	else if (role == 1) return 'control';
	else if (role == 2) return 'security';
	return undefined;
};

export { userRoleAsString, isUserAdmin, isUserControl, isUserAdminOrSecurity, isUserAdminOrControlOrSecurity, isUserAdminOrControl };
