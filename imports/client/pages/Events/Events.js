import React from 'react';
import { Link } from 'react-router-dom';
import Data from './Data';

import './Events.scss';

const RenderHeader = props => (
	<div className="Events">
		<div className="page-header clearfix">
			<div className="pull-right"><h4>ארועים</h4></div>
		</div>
		<Data {...props} />
	</div>
);

export default RenderHeader;
