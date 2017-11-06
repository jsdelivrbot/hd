import React from 'react';
import HydrantEditor from '../../Hydrants/HydrantEditor/HydrantEditor';

const NewHydrant = ({ history }) => (
	<div className="NewHydrant">
		<h4 className="page-header ">הידרנט חדש</h4>
		<HydrantEditor history={history} />
	</div>
);
export default NewHydrant;
