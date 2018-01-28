import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { getCustomDeviceId } from './utils';

function getRole(props) {
	if (props) {
		const { user, deviceInfo } = props;
		const { userId } = user;
		if (userId && getCustomDeviceId({ deviceInfo })) {
			const user = Meteor.users.findOne({ $and: [{ userId }, { customDeviceId: { $elemMatch: { props.customDeviceId } } }] });
			return _.get(user, 'role', false);
		}
	}
	const user = Meteor.user();
	return _.get(user, 'role', false);
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
