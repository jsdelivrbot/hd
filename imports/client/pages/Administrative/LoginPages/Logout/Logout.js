import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Route, Redirect } from 'react-router-dom';

import './Logout.scss';

class Logout extends React.Component {
	componentDidMount() {
		Meteor.logout();
	}

	render() {
		return (
			<Redirect to="/login" />
		);
	}
}

Logout.propTypes = {};

export default Logout;
