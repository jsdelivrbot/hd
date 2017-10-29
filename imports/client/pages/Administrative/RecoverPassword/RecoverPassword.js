import React from 'react';
import { Row, Col, Alert, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import AccountPageFooter from '../../../LayoutLoginAndNavigationAndGeneral/MaybeNotNeeded/AccountPageFooter/AccountPageFooter';
import validate from '../../../../modules/validate';

class RecoverPassword extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		const component = this;

		validate(component.form, {
			rules: {
				emailAddress: {
					required: true,
					email: true,
				},
			},
			messages: {
				emailAddress: {
					required: 'Need an email address here.',
					email: 'Is this email address correct?',
				},
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	handleSubmit() {
		const { history } = this.props;
		const email = this.emailAddress.value;

		Accounts.forgotPassword({ email }, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert(`בדוק את ${email}&emsp; האם יש סיסמה קישור לאיפוס סיסמה`, 'success', 'growl-top-left');
				history.push('/login');
			}
		});
	}

	render() {
		return (<div className="RecoverPassword">
			<Row>
				<Col xs={12} sm={6} md={5} lg={4}>
					<h4 className="page-header">שיחזור סיסמה</h4>
					<Alert bsStyle="info">
						הכנס את האימייל שלך למטה כדי לקבל קישור לאיפוס סיסמה
					</Alert>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						<FormGroup>
							<ControlLabel>אימייל</ControlLabel>
							<input
								type="email"
								name="emailAddress"
								ref={emailAddress => (this.emailAddress = emailAddress)}
								className="form-control"
							/>
						</FormGroup>
						<Button type="submit" bsStyle="success">שחזר סיסמה</Button>
						<AccountPageFooter>
							<p>האם אתה זוכר את ססמתך? <Link to="/login">היכנס</Link>.</p>
						</AccountPageFooter>
					</form>
				</Col>
			</Row>
		</div>);
	}
}

RecoverPassword.propTypes = {
	history: PropTypes.object.isRequired,
};

export default RecoverPassword;
