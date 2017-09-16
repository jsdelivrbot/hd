import React from 'react';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';
import validate from '../../../modules/validate';

class Login extends React.Component {
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
				password: {
					required: true,
				},
			},
			messages: {
				emailAddress: {
					required: 'דרושה כתובת אימייל',
					email: 'האם כתובת האימייל נכונה?',
				},
				password: {
					required: 'דרושה סיסמה',
				},
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	handleSubmit() {
		Meteor.loginWithPassword(this.emailAddress.value, this.password.value, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else { // &ensp;&nbsp;
				Bert.alert('&emsp;ברוך הבא בחזרה!', 'success', 'growl-top-left');
			}
		});
	}

	render() {
		return (<div className="Login">
			<Row>
				<Col xs={12} sm={6} md={5} lg={4}>
					<h4 className="page-header">היכנס לחשבון</h4>
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
						<FormGroup>
							<ControlLabel className="clearfix">
								<span className="pull-right">סיסמה</span>
								<Link className="pull-left" to="/recover-password">האם שכחת סיסמה?</Link>
							</ControlLabel>
							<input
								type="password"
								name="password"
								ref={password => (this.password = password)}
								className="form-control"
							/>
						</FormGroup>
						<Button type="submit" bsStyle="success">היכנס</Button>
						<AccountPageFooter>
							<p>{'אין לך חשבון?'} <Link to="/signup">הירשם</Link>.</p>
						</AccountPageFooter>
					</form>
				</Col>
			</Row>
		</div>);
	}
}

export default Login;
