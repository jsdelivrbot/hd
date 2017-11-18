/* eslint-disable no-nested-ternary */

import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

export default ({ loggingIn, authenticated, isUserSecurity, component, path, exact, ...rest }) => (
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
