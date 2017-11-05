/* eslint-disable jsx-a11y/no-href */

import React from 'react';
import { Meteor } from 'meteor/meteor';
import {
	withHandlers,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
} from 'recompose';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Grid, Alert, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';

import Map from '../../components/Map/Map';
import Events from '../../components/Events/Events';
import Hydrants from '../../pages/Hydrants/Hydrants';
import NewHydrant from '../../pages/Hydrants/NewHydrant/NewHydrant';
import ViewHydrant from '../../pages/Hydrants/ViewHydrant/ViewHydrant';
import EditHydrant from '../../pages/Hydrants/EditHydrant/EditHydrant';
import Companies from '../../pages/Companies/Companies';
import Users from '../../pages/Users/Users';

import Signup from '../../pages/Administrative/LoginPages/Signup/Signup';
import Login from '../../pages/Administrative/LoginPages/Login/Login';
import Logout from '../../pages/Administrative/LoginPages/Logout/Logout';
import VerifyEmail from '../../pages/Administrative/LoginPages/VerifyEmail/VerifyEmail';
import RecoverPassword from '../../pages/Administrative/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/Administrative/LoginPages/ResetPassword/ResetPassword';
import DownloadApp from '../../pages/DownloadApp/DownloadApp';
import Profile from '../../pages/Administrative/Profile/Profile';
import Index from '../Index/Index';

import Public from '../../components/LayoutLoginAndNavigationAndGeneral/Public/Public';
import Navigation from '../../components/LayoutLoginAndNavigationAndGeneral/Navigation/Navigation';
import Authenticated from '../../components/LayoutLoginAndNavigationAndGeneral/Authenticated/Authenticated';
import NotFound from '../../components/LayoutLoginAndNavigationAndGeneral/NotFound/NotFound';
import Footer from '../../components/LayoutLoginAndNavigationAndGeneral/Footer/Footer';
import Loading from '../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';

import './Css/App.scss';

import { meteorData } from '../../Utils/Utils';
import {
	reactiveVar,
} from '../../Storage/Storage';

const handleResendVerificationEmail = (emailAddress) => {
	Meteor.call('users.sendVerificationEmail', (error) => {
		if (error) {
			Bert.alert(error.reason, 'danger');
		} else {
			Bert.alert(`Check ${emailAddress} for a verification link!`, 'success', 'growl-top-left');
		}
	});
};

const verificationAlert = (p) => {
	if (0 && p.userId && !p.emailVerified) {
		return (
			<Alert className="verify-email text-center">
				<p>
					הי חבר!
					<strong>האם אתה יכול לוודא את כתובת האימייל</strong>
					({p.emailAddress})
					בשבילינו?
					<Button
						bsStyle="link"
						onClick={() => handleResendVerificationEmail(p.emailAddress)}
						href="#"
					>
						שלח אימייל זיהוי מחדש
					</Button>
				</p>
			</Alert>
		);
	}
	return '';
};

const getUserName = name => ({
	string: name,
	object: `${name.first} ${name.last}`,
}[typeof name]);

export default compose(
	meteorData(() => {
		const loggingIn = Meteor.loggingIn();
		const user = Meteor.user();
		const userId = Meteor.userId();
		const name = user && user.profile && user.profile.name && getUserName(user.profile.name);
		const emailAddress = user && user.emails && user.emails[0].address;
		const authenticated = !loggingIn && !!userId;
		const style = authenticated ? '' : 'bck';
		return {
			style,
			loggingIn,
			authenticated,
			name: name || emailAddress,
			userId,
			emailAddress,
			emailVerified: user && user.emails ? user && user.emails && user.emails[0].verified : true,
		};
	}),
	withStateHandlers(
		() => ({
			types: {},
			role: undefined,
			appLoading: false,
			appInitialized: false,
		}), {
			setAppLoading: () => appLoading => ({ appLoading }),
			setTypes: () => types => ({ types }),
			setRole: () => role => ({ role }),
			setAppInitialized: () => appInitialized => ({ appInitialized }),
		}
	),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			console.log('initializing');
			p.setAppLoading(true);
			p.setTypes(await Meteor.callPromise('get.types'));
			const { company, role } = await Meteor.callPromise('users.get.properties');
			reactiveVar.set({ company });
			p.setRole(role);
			p.setAppLoading(false);
			p.setAppInitialized(true);
		},
	}),
	branch(p => p.authenticated && !p.appInitialized, renderComponent(Loading)),
)(
	(p) => {
		return (
			<Router>
				<div className={`App ${p.style}`}>
					{() => verificationAlert(p)}
					{ p.authenticated ? <Navigation {...p} /> : '' }
					<Grid>
						<Switch>
							<Authenticated exact path="/" component={Index} {...p} />
							<Authenticated exact path="/download_app" component={DownloadApp} {...p} />
							<Authenticated exact path="/companies" component={Companies} {...p} />
							<Authenticated exact path="/users" component={Users} {...p} />
							<Authenticated exact path="/map" component={Map} {...p} />
							<Authenticated exact path="/events" component={Events} {...p} />
							<Authenticated exact path="/hydrants" component={Hydrants} {...p} />
							<Authenticated exact path="/hydrants/new" component={NewHydrant} {...p} />
							<Authenticated exact path="/hydrants/:_id" component={ViewHydrant} {...p} />
							<Authenticated exact path="/hydrants/:_id/edit" component={EditHydrant} {...p} />
							<Authenticated exact path="/profile" component={Profile} {...p} />
							<Public path="/signup" component={Signup} {...p} />
							<Public path="/login" component={Login} {...p} />
							<Route path="/logout" component={Logout} {...p} />
							<Route name="verify-email" path="/verify-email/:token" component={VerifyEmail} />
							<Route name="recover-password" path="/recover-password" component={RecoverPassword} />
							<Route name="reset-password" path="/reset-password/:token" component={ResetPassword} />
							<Route component={NotFound} />
						</Switch>
					</Grid>
					{ p.authenticated ? <Footer {...p} /> : '' }
				</div>
			</Router>
		);
	});

