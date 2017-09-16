import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const Public = ({ loggingIn, authenticated, component, path, exact, ...rest }) => (
	<Route
		parth={path}
		exact={exact}
		render={props => (
			!authenticated ?
				(React.createElement(component, { ...props, ...rest, loggingIn, authenticated })) :
				(<Redirect to="/hydrants" />)
		)}
	/>
);

Public.propTypes = {
	path: PropTypes.string.isRequired,
	exact: PropTypes.bool,
	loggingIn: PropTypes.bool.isRequired,
	authenticated: PropTypes.bool.isRequired,
	component: PropTypes.func.isRequired,
};

export default Public;
