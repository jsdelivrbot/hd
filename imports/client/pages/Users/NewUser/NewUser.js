
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Bert } from 'meteor/themeteorchef:bert';
import AccountPageFooter from '../../../../components/LayoutLoginAndNavigationAndGeneral/MaybeNotNeeded/AccountPageFooter/AccountPageFooter';
import validate from '../../../../../modules/validate';

class NewUser extends React.Component {
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
			},
			messages: {
				firstName: {
					required: 'מה שמך?',
				},
				lastName: {
					required: 'מה שם משפחתך?',
				},
				emailAddress: {
					required: 'דרוש אימייל',
					email: 'האם כתובת האימייל נכונה?',
				},
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	async handleSubmit() {
		const { history } = this.props;
		await Meteor.callPromise('user.get.all')

// Accounts.createUser({
// 	email: this.emailAddress.value,
// 	password: this.password.value,
// 	profile: {
// 		name: {
// 			first: this.firstName.value,
// 			last: this.lastName.value,
// 		},
// 	},
// }, (error) => {
// 	if (error) {
// 		Bert.alert(error.reason, 'danger');
// 	} else {
// 		Meteor.call('user.sendVerificationEmail');
// 		Bert.alert('&emsp;ברוך הבא!', 'success', 'growl-top-left');
// 		history.push('/');
// 	}
// });

	}

	render() {
		return (<div className="Signup">
			<Row>
				<Col xs={12} sm={6} md={5} lg={4}>
					<h4 className="page-header">פתח חשבון</h4>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						<Row>
							<Col xs={6}>
								<FormGroup>
									<ControlLabel>שם</ControlLabel>
									<input
										type="text"
										name="firstName"
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
								ref={emailAddress => (this.emailAddress = emailAddress)}
								className="form-control"
							/>
						</FormGroup>
						<Button type="submit" bsStyle="success">הירשם</Button>
					</form>
				</Col>
			</Row>
		</div>);
	}
}

export default NewUser;




