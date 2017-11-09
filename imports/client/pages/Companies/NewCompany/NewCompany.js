import React from 'react';
import CompanyEditor from '../components/CompanyEditor/CompanyEditor';

const NewCompany = ({ history }) => (
	<div className="NewCompany">
		<h4 className="page-header ">חברה חדשה</h4>
		<CompanyEditor history={history} />
	</div>
);
export default NewCompany;
