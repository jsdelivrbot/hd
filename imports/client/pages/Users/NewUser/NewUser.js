
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../../../modules/validate';

import './Css/NewUser.scss';

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
		const p = this.props;
		await Meteor.callPromise('user.new', {
			email: this.emailAddress.value,
			password: this.password.value,
			firstName: this.firstName.value,
			lastName: this.lastName.value,
		});
		Bert.alert('&emsp;ברוך הבא!', 'success', 'growl-top-left');
		p.history.push('/users');
	}

	render() {
		return (
			<div className="NewUser">
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
			</div>
		);
	}
}

export default NewUser;




