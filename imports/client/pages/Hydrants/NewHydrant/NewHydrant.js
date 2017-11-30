import React from 'react';
import HydrantEditor from '../components/HydrantEditor/HydrantEditor';

const NewHydrant = p => (
	<div className="NewHydrant">
		<h4 className="page-header ">הידרנט חדש</h4>
		<HydrantEditor data={{ }} {...p} />
	</div>
);
export default NewHydrant;
