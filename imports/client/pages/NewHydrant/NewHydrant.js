import React from 'react';
import PropTypes from 'prop-types';
import HydrantEditor from '../../components/HydrantEditor/HydrantEditor';

const NewHydrant = ({ history }) => (
	<div className="NewHydrant">
		<h4 className="page-header ">הידרנט חדש</h4>
		<HydrantEditor history={history} />
	</div>
);

NewHydrant.propTypes = {
	history: PropTypes.object.isRequired,
};

export default NewHydrant;
