



import React from 'react';
import { Meteor } from 'meteor/meteor';
import {
	withHandlers,
	compose,
	withStateHandlers,
	lifecycle,
	renderComponent,
	branch,
} from 'recompose';
import _ from 'lodash';
import { Flex, Box } from 'reflexbox';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import 'react-select/dist/react-select.css';

import validate from '../../../../modules/validate';

import './Css/NewUser.scss';

import Loading from '../../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';

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
			firstName: this.firstName.value,
			lastName: this.lastName.value,
			companyId: this.company.value,
			role: this.role.value,
		});
		Bert.alert('&emsp;ברוך הבא!', 'success', 'growl-top-left');
		p.history.push('/users');
	}

	render() {
		const p = this.props;
		return (
			<div className="NewUser">
				<Row>
					<Col xs={12} sm={6} md={5} lg={4}>
						<h4 className="page-header">פתח חשבון</h4>
						<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
							<Row>
								<Col xs={6}>
									<FormGroup>
										<ControlLabel>חברה</ControlLabel>
										<select
											name="company"
											ref={company => (this.company = company)}
											className="form-control"
										>
											{p.cData.map(el =>
												(<option key={el._id} value={el._id}>{el.name}</option>)
											)}
										</select>
									</FormGroup>
								</Col>
								<Col xs={6}>
									<FormGroup>
										<ControlLabel>תפקיד</ControlLabel>
										<select
											name="role"
											ref={role => (this.role = role)}
											className="form-control"
										>
											{_.map(p.types.roles, (role, n) => (
												<option key={n} value={n}>{role}</option>)
											)}
										</select>
									</FormGroup>
								</Col>
							</Row>
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

export default compose(
	withStateHandlers(
		() => ({
			cData: [],
			initialized: false,
			loading: false,
		}), {
			setCData: () => cData => ({ cData: _.clone(cData) }),
			setLoading: () => loading => ({ loading }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	lifecycle({
		async componentDidMount() {
			console.log('initializing');
			const p = this.props;
			p.setLoading(true);
			p.setCData(await Meteor.callPromise('companies.get.all'));
			p.setLoading(false);
			p.setInitialized(true);
			console.log('initialized');
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(NewUser);
