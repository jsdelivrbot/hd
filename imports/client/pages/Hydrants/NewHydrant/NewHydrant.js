import React from 'react';
import HydrantEditor from '../components/HydrantEditor/HydrantEditor';

const NewHydrant = p => (
	<div className="NewHydrant">
		<h4 className="page-header ">הידרנט חדש</h4>
		<HydrantEditor history={p.history} data={{ }} company={p.company} types={p.types} />
	</div>
);
export default NewHydrant;
