/* eslint-disable jsx-a11y/no-href */

import React from 'react';
import PropTypes from 'prop-types';
import { Link, BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { NavLink } from 'react-router';
import { Grid, Alert, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { Bert } from 'meteor/themeteorchef:bert';
import Navigation from '../../components/LayoutLoginAndNavigationAndGeneral/Navigation/Navigation';
import Authenticated from '../../components/LayoutLoginAndNavigationAndGeneral/Authenticated/Authenticated';
import Public from '../../components/LayoutLoginAndNavigationAndGeneral/Public/Public';
import Index from '../Index/Index';
import Map from '../../pages/Map/Map';
import Events from '../../pages/Events/Events';
import Hydrants from '../../pages/Hydrants/Hydrants';
import NewHydrant from '../../pages/NewHydrant/NewHydrant';
import ViewHydrant from '../../pages/ViewHydrant/ViewHydrant';
import EditHydrant from '../../pages/EditHydrant/EditHydrant';
import Signup from '../../pages/Administrative/LoginPages/Signup/Signup';
import Login from '../../pages/Administrative/LoginPages/Login/Login';
import Logout from '../../pages/Administrative/LoginPages/Logout/Logout';
import VerifyEmail from '../../pages/Administrative/LoginPages/VerifyEmail/VerifyEmail';
import RecoverPassword from '../../pages/Administrative/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/Administrative/LoginPages/ResetPassword/ResetPassword';
import Profile from '../../pages/Administrative/Profile/Profile';
import NotFound from '../../components/LayoutLoginAndNavigationAndGeneral/NotFound/NotFound';
import Footer from '../../components/LayoutLoginAndNavigationAndGeneral/Footer/Footer';
import DownloadApp from '../../pages/DownloadApp/DownloadApp';
import Companies from '../../pages/Companies/Companies';
import Users from '../../pages/Users/Users';


import './Css/App.scss';

const handleResendVerificationEmail = (emailAddress) => {
	Meteor.call('users.sendVerificationEmail', (error) => {
		if (error) {
			Bert.alert(error.reason, 'danger');
		} else {
			Bert.alert(`Check ${emailAddress} for a verification link!`, 'success', 'growl-top-left');
		}
	});
};


const App = props => (
	<Router>
		{!props.loading ?
			<div className={`App ${props.style}`}>
				{0 && props.userId && !props.emailVerified ?
					<Alert className="verify-email text-center">
						<p>
							הי חבר!
							<strong>האם אתה יכול לוודות את כתובת האימייל</strong>
							({props.emailAddress})
							בשבילינו?
							<Button
								bsStyle="link"
								onClick={() => handleResendVerificationEmail(props.emailAddress)}
								href="#"
							>
								שלח אימייל זיהוי מחדש
							</Button>
						</p>
					</Alert>
					:
					''}
				<Navigation {...props} />
				<Grid>
					<Switch>
						<Authenticated exact path="/" component={Index} {...props} />
						<Authenticated exact path="/download_app" component={DownloadApp} {...props} />
						<Authenticated exact path="/companies" component={Companies} {...props} />
						<Authenticated exact path="/users" component={Users} {...props} />
						<Authenticated exact path="/map" component={Map} {...props} />
						<Authenticated exact path="/events" component={Events} {...props} />
						<Authenticated exact path="/hydrants" component={Hydrants} {...props} />
						<Authenticated exact path="/hydrants/new" component={NewHydrant} {...props} />
						<Authenticated exact path="/hydrants/:_id" component={ViewHydrant} {...props} />
						<Authenticated exact path="/hydrants/:_id/edit" component={EditHydrant} {...props} />
						<Authenticated exact path="/profile" component={Profile} {...props} />
						<Public path="/signup" component={Signup} {...props} />
						<Public path="/login" component={Login} {...props} />
						<Route path="/logout" component={Logout} {...props} />
						<Route name="verify-email" path="/verify-email/:token" component={VerifyEmail} />
						<Route name="recover-password" path="/recover-password" component={RecoverPassword} />
						<Route name="reset-password" path="/reset-password/:token" component={ResetPassword} />
						<Route component={NotFound} />
					</Switch>
				</Grid>
				{ props.authenticated ?
					<Footer {...props} />
					:
					''
				}
			</div>
			:
			''}
	</Router>
);

App.defaultProps = {
	userId: '',
	emailAddress: '',
};

App.propTypes = {
	loading: PropTypes.bool.isRequired,
	userId: PropTypes.string,
	emailAddress: PropTypes.string,
	emailVerified: PropTypes.bool.isRequired,
};

const getUserName = name => ({
	string: name,
	object: `${name.first} ${name.last}`,
}[typeof name]);

export default createContainer(() => {
	const loggingIn = Meteor.loggingIn();
	const user = Meteor.user();
	const userId = Meteor.userId();
	const loading = !Roles.subscription.ready();
	const name = user && user.profile && user.profile.name && getUserName(user.profile.name);
	const emailAddress = user && user.emails && user.emails[0].address;
	const authenticated = !loggingIn && !!userId;
	// const style = 'bck';
	const style = authenticated ? '' : 'bck';

	return {
		style,
		loading,
		loggingIn,
		authenticated,
		name: name || emailAddress,
		roles: !loading && Roles.getRolesForUser(userId),
		userId,
		emailAddress,
		emailVerified: user && user.emails ? user && user.emails && user.emails[0].verified : true,
	};
}, App);