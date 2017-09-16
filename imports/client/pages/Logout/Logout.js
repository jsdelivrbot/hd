import React from 'react';
import { Meteor } from 'meteor/meteor';

import './Logout.scss';

class Logout extends React.Component {
	componentDidMount() {
		Meteor.logout();
	}

	render() {
		return (
			<div className="Logout">
				<img
					src="https://s3-us-west-2.amazonaws.com/cleverbeagle-assets/graphics/email-icon.png"
					alt="Clever Beagle"
				/>
			</div>
		);
	}
}

Logout.propTypes = {};

export default Logout;
