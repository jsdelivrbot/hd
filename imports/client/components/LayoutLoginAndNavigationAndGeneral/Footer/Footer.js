
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
	withHandlers,
	compose,
	withStateHandlers,
	lifecycle,
} from 'recompose';

import './Footer.scss';

import {
	reactiveVar,
} from '../../../Storage/Storage';

export default compose(
	withTracker(() => {
		console.log('tracker footer');
		return {
			company: reactiveVar.get().company || { key: 1, number: 1, name: 'תאגיד עין אפק 1' }
		};
	}),
)(
	(p) => {
		console.log('rendering');

		return (
			<footer className="Footer">
				<p>
					{p.company.name}
				</p>
			</footer>
		);
	});

// //
// <p>תאגיד עין אפק</p>
//
//
// <p className="pull-right">&copy; {copyrightYear()} Application Name</p>
//
// <ul className="pull-right">
// 	<li><Link to="/terms">Terms<span className="hidden-xs"> of Service</span></Link></li>
// 	<li><Link to="/privacy">Privacy<span className="hidden-xs"> Policy</span></Link></li>
// </ul>
