/* eslint-disable jsx-a11y/no-href */

import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
	withHandlers,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
	withProps,
} from 'recompose';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Grid, Alert, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';

import Map from '../../components/Map/Map';
import Events from '../../components/Events/Events';

import Users from '../../pages/Users/Users';
import NewUser from '../../pages/Users/NewUser/NewUser';

import Hydrants from '../../pages/Hydrants/Hydrants';
import NewHydrant from '../../pages/Hydrants/NewHydrant/NewHydrant';
import ViewHydrant from '../../pages/Hydrants/ViewHydrant/ViewHydrant';
import EditHydrant from '../../pages/Hydrants/EditHydrant/EditHydrant';

import Companies from '../../pages/Companies/Companies';
import NewCompany from '../../pages/Companies/NewCompany/NewCompany';
import ViewCompany from '../../pages/Companies/ViewCompany/ViewCompany';
import EditCompany from '../../pages/Companies/EditCompany/EditCompany';

import Login from '../../pages/Administrative/LoginPages/Login/Login';
import Logout from '../../pages/Administrative/LoginPages/Logout/Logout';
import RecoverPassword from '../../pages/Administrative/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/Administrative/LoginPages/ResetPassword/ResetPassword';
import DownloadApp from '../../pages/DownloadApp/DownloadApp';
import Profile from '../../pages/Administrative/Profile/Profile';
import Index from '../Index/Index';

import Public from '../../components/LayoutLoginAndNavigationAndGeneral/Public/Public';
import Navigation from '../../components/LayoutLoginAndNavigationAndGeneral/Navigation/Navigation';
import Authenticated from '../../components/LayoutLoginAndNavigationAndGeneral/Authenticated/Authenticated';
import AuthenticatedSite from '../../components/LayoutLoginAndNavigationAndGeneral/AuthenticatedSite/AuthenticatedSite';
import NotFound from '../../components/LayoutLoginAndNavigationAndGeneral/NotFound/NotFound';
import Footer from '../../components/LayoutLoginAndNavigationAndGeneral/Footer/Footer';
import Loading from '../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';

import './Css/App.scss';

import {
	reactiveVar,
} from '../../Storage/Storage';

const handleResendVerificationEmail = (emailAddress) => {
	Meteor.call('user.sendVerificationEmail', (error) => {
		if (error) {
			Bert.alert(error.reason, 'danger');
		} else {
			Bert.alert(`בדוק בדואר שלך ${emailAddress} את קישור האימות`, 'success', 'growl-top-left');
		}
	});
};

const getUserName = name => ({
	string: name,
	object: `${name.first} ${name.last}`,
}[typeof name]);

export default compose(
	withTracker(() => {
		console.log('app tracker');
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
	// withProps((p) => {
	// 	console.log('p.authenticated');
	// 	console.log(p.authenticated);
	// 	console.log('p.initialized');
	// 	console.log(p.initialized);
	// 	console.log('p.loggingIn');
	// 	console.log(p.loggingIn);
	// }),
	withHandlers({
		isUserAdmin: ({ role }) => () => (role === 0),
		isUserControl: ({ role }) => () => (role === 1),
		isUserSecurity: ({ role }) => () => (role === 2),
	}),
	lifecycle({
		async componentWillReceiveProps(p) {
			if (p.authenticated && !p.appInitialized) {
				p.setAppLoading(true);
				p.setTypes(await Meteor.callPromise('utility.get.types'));
				const { company, role } = await Meteor.callPromise('user.get.properties');
				reactiveVar.set({ company });
				p.setRole(role);
				p.setAppLoading(false);
				p.setAppInitialized(true);
			}
		},
	}),
	branch(p => p.loggingIn || (p.authenticated && !p.appInitialized), renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering app');
		return (
			<Router>
				<div className={`App ${p.style}`}>
					{ p.authenticated && !p.isUserSecurity ? <Navigation {...p} /> : '' }
					<Grid>
						<Switch>
							<Authenticated exact path="/" component={Index} {...p} />
							<Authenticated exact path="/download_app" component={DownloadApp} {...p} />
							<Authenticated exact path="/profile" component={Profile} {...p} />

							<AuthenticatedSite exact path="/users" component={Users} {...p} />
							<AuthenticatedSite exact path="/users/new" component={NewUser} {...p} />
							<AuthenticatedSite exact path="/map" component={Map} {...p} />
							<AuthenticatedSite exact path="/events" component={Events} {...p} />

							<AuthenticatedSite exact path="/companies" component={Companies} {...p} />
							<AuthenticatedSite exact path="/companies/new" component={NewCompany} {...p} />
							<AuthenticatedSite exact path="/companies/:_id" component={ViewCompany} {...p} />
							<AuthenticatedSite exact path="/companies/:_id/edit" component={EditCompany} {...p} />

							<AuthenticatedSite exact path="/hydrants" component={Hydrants} {...p} />
							<AuthenticatedSite exact path="/hydrants/new" component={NewHydrant} {...p} />
							<AuthenticatedSite exact path="/hydrants/:_id" component={ViewHydrant} {...p} />
							<AuthenticatedSite exact path="/hydrants/:_id/edit" component={EditHydrant} {...p} />


							<Public path="/login" component={Login} {...p} />

							<Route path="/logout" component={Logout} {...p} />
							<Route name="recover-password" path="/recover-password" component={RecoverPassword} />
							<Route name="reset-password" path="/reset-password/:token" component={ResetPassword} />
							<Route name="enroll-account" path="/enroll-account/:token" component={ResetPassword} />

							<Route component={NotFound} />
						</Switch>
					</Grid>
					{ p.authenticated ? <Footer {...p} /> : '' }
				</div>
			</Router>
		);
	});

// {p.verificationAlert()}
// withHandlers({
// 	verificationAlert: p => () => {
// 		if (p.userId && !p.emailVerified) {
// 			return (
// 				<Alert className="verify-email text-center">
// 					<p>
// 						הי חבר!
// 						<strong>האם אתה יכול לוודא את כתובת האימייל</strong>
// 						({p.emailAddress})
// 						בשבילינו?
// 						<Button
// 							bsStyle="link"
// 							onClick={() => handleResendVerificationEmail(p.emailAddress)}
// 							href="#"
// 						>
// 							שלח אימייל זיהוי מחדש
// 						</Button>
// 					</p>
// 				</Alert>
// 			);
// 		}
// 		return '';
// 	},
// }),
