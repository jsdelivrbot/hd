import React from 'react';
import { Link } from 'react-router-dom';
import Data from './Data';

import './Hydrants.scss';

const RenderHeader = props => (
	<div className="Hydrants">
		<div className="page-header clearfix">
			<div className="pull-right"><h4>הידרנטים</h4></div>
			<div><Link className="btn btn-success pull-left" to={`${props.match.url}/new`}>הוסף הידרנט</Link></div>
		</div>
		<Data {...props} />
	</div>
);

export default RenderHeader;
