import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';

class VerifyEmail extends React.Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	componentDidMount() {
		const { match, history } = this.props;
		Accounts.verifyEmail(match.params.token, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
				this.setState({ error: `${error.reason}. נא לנסות שוב` });
			} else {
				setTimeout(() => {
					Bert.alert('&emsp;הכל מוכן, תודה!', 'success', 'growl-top-left');
					history.push('/');
				}, 2500);
			}
		});
	}

	render() {
		return (
			<div className="VerifyEmail">
				<Alert bsStyle={!this.state.error ? 'info' : 'danger'}>
					{!this.state.error ? 'מוודאים...' : this.state.error}
				</Alert>
			</div>
		);
	}
}

VerifyEmail.propTypes = {
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default VerifyEmail;
