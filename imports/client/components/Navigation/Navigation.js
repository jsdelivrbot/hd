import React from 'react';
import PropTypes from 'prop-types';
import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PublicNavigation from '../PublicNavigation/PublicNavigation';
import AuthenticatedNavigation from '../AuthenticatedNavigation/AuthenticatedNavigation';


const Navigation = props => (
	<div>
		{props.authenticated ? <AuthenticatedNavigation {...props} /> : ''}
	</div>
);

Navigation.defaultProps = {
	name: '',
};

Navigation.propTypes = {
	authenticated: PropTypes.bool.isRequired,
};

export default Navigation;
