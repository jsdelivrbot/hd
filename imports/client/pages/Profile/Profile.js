/* eslint-disable no-underscore-dangle */

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import { createContainer } from 'meteor/react-meteor-data';
import InputHint from '../../components/InputHint/InputHint';
import validate from '../../../modules/validate';

import './Profile.scss';

class Profile extends React.Component {
	constructor(props) {
		super(props);

		this.getUserType = this.getUserType.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.renderOAuthUser = this.renderOAuthUser.bind(this);
		this.renderPasswordUser = this.renderPasswordUser.bind(this);
		this.renderProfileForm = this.renderProfileForm.bind(this);
	}

	componentDidMount() {
		const component = this;

		validate(component.form, {
			rules: {
				firstName: {
					required: true,
				},
				lastName: {
					required: true,
				},
				emailAddress: {
					required: true,
					email: true,
				},
				currentPassword: {
					required() {
						// Only required if newPassword field has a value.
						return component.newPassword.value.length > 0;
					},
				},
				newPassword: {
					required() {
						// Only required if currentPassword field has a value.
						return component.currentPassword.value.length > 0;
					},
				},
			},
			messages: {
				firstName: {
					required: 'מה שמך?',
				},
				lastName: {
					required: 'מה שם משפחתך?',
				},
				emailAddress: {
					required: 'נא לרשום אימייל',
					email: 'האם האימייל נכון?',
				},
				currentPassword: {
					required: 'אם דרושה סיסמה חדשה, נא להכניס סיסמה',
				},
				newPassword: {
					required: 'אם דרושה סיסמה חדשה, נא להכניס סיסמה',
				},
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	getUserType(user) {
		const userToCheck = user;
		delete userToCheck.services.resume;
		const service = Object.keys(userToCheck.services)[0];
		return service === 'password' ? 'password' : 'oauth';
	}

	handleSubmit() {
		const profile = {
			emailAddress: this.emailAddress.value,
			profile: {
				name: {
					first: this.firstName.value,
					last: this.lastName.value,
				},
			},
		};

		Meteor.call('users.editProfile', profile, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('&emsp;הפרופיל התעדכן!', 'success', 'growl-top-left');
			}
		});

		if (this.newPassword.value) {
			Accounts.changePassword(this.currentPassword.value, this.newPassword.value, (error) => {
				if (error) {
					Bert.alert(error.reason, 'danger');
				} else {
					this.currentPassword.value = '';
					this.newPassword.value = '';
				}
			});
		}
	}

	renderOAuthUser(loading, user) {
		return !loading ? (<div className="OAuthProfile">
			{Object.keys(user.services).map(service => (
				<div key={service} className={`LoggedInWith ${service}`}>
					<img src={`/${service}.svg`} alt={service} />
					<p>{`You're logged in with ${_.capitalize(service)} using the email address ${user.services[service].email}.`}</p>
					<Button
						className={`btn btn-${service}`}
						href={{
							facebook: 'https://www.facebook.com/settings',
							google: 'https://myaccount.google.com/privacy#personalinfo',
							github: 'https://github.com/settings/profile',
						}[service]}
						target="_blank"
					>Edit Profile on {_.capitalize(service)}</Button>
				</div>
			))}
		</div>) : <div />;
	}

	renderPasswordUser(loading, user) {
		return !loading ? (<div>
			<Row>
				<Col xs={6}>
					<FormGroup>
						<ControlLabel>שם</ControlLabel>
						<input
							type="text"
							name="firstName"
							defaultValue={user.profile.name.first}
							ref={firstName => (this.firstName = firstName)}
							className="form-control"
						/>
					</FormGroup>
				</Col>
				<Col xs={6}>
					<FormGroup>
						<ControlLabel>שם משפחה</ControlLabel>
						<input
							type="text"
							name="lastName"
							defaultValue={user.profile.name.last}
							ref={lastName => (this.lastName = lastName)}
							className="form-control"
						/>
					</FormGroup>
				</Col>
			</Row>
			<FormGroup>
				<ControlLabel>אימייל</ControlLabel>
				<input
					type="email"
					name="emailAddress"
					defaultValue={user.emails[0].address}
					ref={emailAddress => (this.emailAddress = emailAddress)}
					className="form-control"
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>סיסמה נוכחית</ControlLabel>
				<input
					type="password"
					name="currentPassword"
					ref={currentPassword => (this.currentPassword = currentPassword)}
					className="form-control"
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>סיסמה חדשה</ControlLabel>
				<input
					type="password"
					name="newPassword"
					ref={newPassword => (this.newPassword = newPassword)}
					className="form-control"
				/>
				<InputHint>נא להשתמש בלפחות שישה תווים</InputHint>
			</FormGroup>
			<Button type="submit" bsStyle="success">לשמור פרופיל</Button>
		</div>) : <div />;
	}

	renderProfileForm(loading, user) {
		return !loading ? ({
			password: this.renderPasswordUser,
			oauth: this.renderOAuthUser,
		}[this.getUserType(user)])(loading, user) : <div />;
	}

	render() {
		const { loading, user } = this.props;
		return (<div className="Profile">
			<Row>
				<Col xs={12} sm={6} md={4}>
					<h4 className="page-header">ערוך פרופיל</h4>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						{this.renderProfileForm(loading, user)}
					</form>
				</Col>
			</Row>
		</div>);
	}
}

Profile.propTypes = {
	loading: PropTypes.bool.isRequired,
	user: PropTypes.object.isRequired,
};

export default createContainer(() => {
	const subscription = Meteor.subscribe('users.editProfile');

	return {
		loading: !subscription.ready(),
		user: Meteor.user(),
	};
}, Profile);
