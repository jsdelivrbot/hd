/* eslint-disable jsx-a11y/no-href */

import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Grid, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { Bert } from 'meteor/themeteorchef:bert';
import Navigation from '../../components/Navigation/Navigation';
import Authenticated from '../../components/Authenticated/Authenticated';
import Public from '../../components/Public/Public';
import Index from '../../pages/Index/Index';
import Map from '../../pages/Map/Map';
import Events from '../../pages/Events/Events';
import Hydrants from '../../pages/Hydrants/Hydrants';
import NewHydrant from '../../pages/NewHydrant/NewHydrant';
import ViewHydrant from '../../pages/ViewHydrant/ViewHydrant';
import EditHydrant from '../../pages/EditHydrant/EditHydrant';
import Signup from '../../pages/Signup/Signup';
import Login from '../../pages/Login/Login';
import Logout from '../../pages/Logout/Logout';
import VerifyEmail from '../../pages/VerifyEmail/VerifyEmail';
import RecoverPassword from '../../pages/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/ResetPassword/ResetPassword';
import Profile from '../../pages/Profile/Profile';
import NotFound from '../../components/NotFound/NotFound';
import Footer from '../../components/Footer/Footer';
import Terms from '../../pages/Terms/Terms';
import Privacy from '../../pages/Privacy/Privacy';

import './App.scss';

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
			<div className="App">
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
						<Route exact name="index" path="/" component={Index} />
						<Authenticated exact path="/map" component={Map} {...props} />
						<Authenticated exact path="/hydrants" component={Hydrants} {...props} />
						<Authenticated exact path="/events" component={Events} {...props} />
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
						<Route name="terms" path="/terms" component={Terms} />
						<Route name="privacy" path="/privacy" component={Privacy} />
						<Route component={NotFound} />
					</Switch>
				</Grid>
				<Footer />
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

	return {
		loading,
		loggingIn,
		authenticated: !loggingIn && !!userId,
		name: name || emailAddress,
		roles: !loading && Roles.getRolesForUser(userId),
		userId,
		emailAddress,
		emailVerified: user && user.emails ? user && user.emails && user.emails[0].verified : true,
	};
}, App);
