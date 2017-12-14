/* eslint-disable jsx-a11y/no-href */
/* eslint-disable no-nested-ternary */

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

import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Grid } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import moment from 'moment';
import 'moment/locale/he';

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

import Login from '../../pages/LoginPages/Login/Login';
import Logout from '../../pages/LoginPages/Logout/Logout';
import RecoverPassword from '../../pages/LoginPages/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/LoginPages/ResetPassword/ResetPassword';
import DownloadApp from '../../pages/DownloadApp/DownloadApp';
import Profile from '../../pages/LoginPages/Profile/Profile';
import Index from '../Index/Index';

import Navigation from '../../components/LoginLayoutNavigation/Navigation/Navigation';
import NotFound from '../../components/LoginLayoutNavigation/NotFound/NotFound';
import Footer from '../../components/LoginLayoutNavigation/Footer/Footer';
import Loading from '../../components/LoginLayoutNavigation/Loading/Loading';

import { resetStore } from '../../components/Storage';
import { difProps } from '../../Utils/Utils';

import './Css/App.scss';

moment.locale('he');

const getUserName = name => ({
	string: name,
	object: `${name.first} ${name.last}`,
}[typeof name]);

const Authenticated = ({ allUser, adminUser, controlUser, ...p }) => {
	return (
		<Route
			path={p.path}
			exact={p.exact}
			render={(routerProps) => {
				return (
					p.authenticated &&
					(allUser ||
						(adminUser && p.isUserAdmin()) ||
						(controlUser && p.isUserControl())
					) ?
						(React.createElement(p.component, { ...routerProps, ...p }))
						:
						(<Redirect to="/login" />)
				);
			}}
		/>
	);
};

const Public = ({ loggingIn, authenticated, component, path, exact, ...rest }) => (
	<Route
		path={path}
		exact={exact}
		render={props => (
			!authenticated ?
				(React.createElement(component, { ...props, ...rest, loggingIn, authenticated })) :
				(<Redirect to="/" />)
		)}
	/>
);

const AllUser = p => Authenticated({ allUser: true, ...p });
const ControlUser = p => Authenticated({ controlUser: true, adminUser: true, ...p });
const AdminUser = p => Authenticated({ adminUser: true, ...p });

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
			appInitialized: undefined,
			company: undefined,
			hydrantEdited: false,
		}), {
			setHydrantEdited: () => hydrantEdited => ({ hydrantEdited }),
			setAppLoading: () => appLoading => ({ appLoading }),
			setTypes: () => types => ({ types }),
			setRole: () => role => ({ role }),
			setAppInitialized: () => appInitialized => ({ appInitialized }),
			setCompany: () => company => ({ company }),
		}
	),
	withHandlers({
		isUserAdmin: ({ role }) => () => (role == 0),
		isUserControl: ({ role }) => () => (role == 1),
		isUserAdminOrControl: ({ role }) => () => (role == 1) || (role == 0),
		isUserSecurity: ({ role }) => () => (role == 2),
	}),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			p.setAppInitialized(false);
		},
		async componentWillReceiveProps(p) {
			const { userId } = difProps({ prevProps: this.props, nextProps: p });
			if (userId) {
				p.setAppInitialized(false);
			}
			if (p.authenticated && !p.appInitialized) {
				if (p.appLoading) return;
				p.setAppLoading(true);
				if (p.isUserAdminOrControl()) p.setTypes(await Meteor.callPromise('utility.get.types'));
				const { company, role } = await Meteor.callPromise('user.get.properties');
				console.log('role');
				console.log(role);
				p.setCompany(company);
				p.setRole(role);
				p.setAppLoading(false);
				p.setAppInitialized(true);
				resetStore();
				console.log('p.userId');
				console.log(p.userId);
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
					{ p.authenticated ? <Navigation {...p} /> : '' }
					<Grid>
						<Switch>
							<AllUser exact path="/" component={Index} {...p} />
							<AllUser exact path="/download_app" component={DownloadApp} {...p} />
							<AllUser exact path="/profile" component={Profile} {...p} />

							<AdminUser exact path="/users" component={Users} {...p} />
							<AdminUser exact path="/users/new" component={NewUser} {...p} />

							<ControlUser exact path="/map" component={Map} {...p} />
							<ControlUser exact path="/events" component={Events} {...p} />

							<AdminUser exact path="/companies" component={Companies} {...p} />
							<AdminUser exact path="/companies/new" component={NewCompany} {...p} />
							<AdminUser exact path="/companies/:_id" component={ViewCompany} {...p} />
							<AdminUser exact path="/companies/:_id/edit" component={EditCompany} {...p} />

							<ControlUser exact path="/hydrants" component={Hydrants} {...p} />
							<AdminUser exact path="/hydrants/new" component={NewHydrant} {...p} />
							<ControlUser exact path="/hydrants/:_id" component={ViewHydrant} {...p} />
							<AdminUser exact path="/hydrants/:_id/edit" component={EditHydrant} {...p} />

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


// LogRocket.startNewSession();
// LogRocket.identify(
// 	p.userId, {
// 		name: p.name,
// 		email: p.emailAddress,
// 		role,
// 		company: company.name,
// 	});


// import LogRocket from 'logrocket';
// require('logrocket-react')(LogRocket);
// LogRocket.init('kdcqzb/hdapp');
//# sourceMappingURL=https://github.com/LiShine/hd

// Raven.config('https://61d91ce1100c4f3696b5a196179a35d7@sentry.io/249201').install()


// withProps((p) => {
// 	console.log('p.authenticated');
// 	console.log(p.authenticated);
// 	console.log('p.initialized');
// 	console.log(p.initialized);
// 	console.log('p.loggingIn');
// 	console.log(p.loggingIn);
// }),

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

// const handleResendVerificationEmail = (emailAddress) => {
// 	Meteor.call('user.sendVerificationEmail', (error) => {
// 		if (error) {
// 			Bert.alert(error.reason, 'danger');
// 		} else {
// 			Bert.alert(`בדוק בדואר שלך ${emailAddress} את קישור האימות`, 'success', 'growl-top-left');
// 		}
// 	});
// };

