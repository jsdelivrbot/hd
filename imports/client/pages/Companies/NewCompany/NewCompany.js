import React from 'react';
import CompanyEditor from '../components/CompanyEditor/CompanyEditor';

const NewCompany = p => (
	<div className="NewCompany">
		<h4 className="page-header ">חברה חדשה</h4>
		<CompanyEditor {...p} />
	</div>
);
export default NewCompany;
