import React from 'react';
import { Grid } from 'react-bootstrap';

import './Footer.scss';

const Footer = () => (
	<footer className="Footer">
		{/*<Grid>*/}
			<p>
				תאגיד עין אפק
			</p>
		{/*</Grid>*/}
	</footer>
);

Footer.propTypes = {};

export default Footer;
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
