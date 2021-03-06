import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../Utils/validate';

class ResetPassword extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		const component = this;

		validate(component.form, {
			rules: {
				newPassword: {
					required: true,
					minlength: 6,
				},
				repeatNewPassword: {
					required: true,
					minlength: 6,
					equalTo: '[name="newPassword"]',
				},
			},
			messages: {
				newPassword: {
					required: 'הכנס סיסמה חדשה',
					minlength: 'נא להשתמש בלפחות שישה תווים',
				},
				repeatNewPassword: {
					required: 'חזורעל הסיסמה בבקשה',
					equalTo: 'נראה שהסיסמאות לא תואמות, האם תרצה לנסות שוב?',
				},
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	handleSubmit() {
		const { match, history } = this.props;
		const token = match.params.token;

		Accounts.resetPassword(token, this.newPassword.value, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				history.push('/');
			}
		});
	}

	render() {
		return (<div className="ResetPassword">
			<Row>
				<Col xs={12} sm={6} md={4}>
					<h4 className="page-header">איפוס סיסמה</h4>
					<Alert bsStyle="info">
						על מנת לאפס את סיסמתך, הכנס סיסמה חדשה כאן מתחת. אתה תוכנס עם סיסמתך החדשה.
					</Alert>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						<FormGroup>
							<ControlLabel>סיסמה חדשה</ControlLabel>
							<input
								dir="ltr"
								type="password"
								className="form-control"
								ref={newPassword => (this.newPassword = newPassword)}
								name="newPassword"
								placeholder="סיסמה חדשה"
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>חזור על הסיסמה החדשה</ControlLabel>
							<input
								dir="ltr"
								type="password"
								className="form-control"
								ref={repeatNewPassword => (this.repeatNewPassword = repeatNewPassword)}
								name="repeatNewPassword"
								placeholder="חזור על סיסמה חדשה"
							/>
						</FormGroup>
						<Button type="submit" bsStyle="success">סיסמה חדשה וכניסה</Button>
					</form>
				</Col>
			</Row>
		</div>);
	}
}

ResetPassword.propTypes = {
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default ResetPassword;
