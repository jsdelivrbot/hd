import React from 'react';
import { Link } from 'react-router-dom';
import Data from './Data';

import './css.scss';

const RenderHeader = props => (
	<div className="Map">
		<div className="page-header clearfix">
			<div className="pull-right"><h4>מפה</h4></div>
		</div>
		<Data {...props} />
	</div>
);

export default RenderHeader;
