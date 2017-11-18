/* eslint-disable no-nested-ternary */

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const Authenticated = ({ loggingIn, authenticated, isUserSecurity, component, path, exact, ...rest }) => (
	<Route
		path={path}
		exact={exact}
		render={props => (
			authenticated ?
				!isUserSecurity ?
					(React.createElement(component, { ...props, ...rest, loggingIn, authenticated }))
					:
					(<Redirect to="/NotFound" />)
				:
				(<Redirect to="/login" />)
		)}
	/>
);

Authenticated.propTypes = {
	loggingIn: PropTypes.bool.isRequired,
	authenticated: PropTypes.bool.isRequired,
	component: PropTypes.func.isRequired,
	exact: PropTypes.bool.isRequired,
	path: PropTypes.string.isRequired,
};

export default Authenticated;
