import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';

import './Css/AuthenticatedNavigation.scss';

const handleFixture = () => {
	Meteor.call('db.init', (error) => {
		if (error) {
			console.log('error');
		} else {
			console.log('database zeroed');
		}
	});
};

const AuthenticatedNavigation = ({ name, history }) => {
	// console.log(history);
	// const lhydrants = (history.location.pathname === '/hydrants') ? 'navactive' : '';
	// const levents = (history.location.pathname === '/events') ? 'navactive' : '';
	// const lmaps = (history.location.pathname === '/maps') ? 'navactive' : '';
	return (
		<div>
			<Link to="/">
				<img
					style={{ width: '100%' }}
					src="top3.png"
					alt="logo"
				/>
			</Link>
			<div style={{ height: '15px' }} />
			<Navbar>
				<Navbar.Collapse>
					<Nav className="_hide-nav" bsStyle="tabs" justified>
						<LinkContainer to="/hydrants">
							<NavItem eventKey={1.1} href="/hydrants">מוצרים מותקנים</NavItem>
						</LinkContainer>
						<LinkContainer to="/events">
							<NavItem eventKey={1.2} href="/events">אירועים</NavItem>
						</LinkContainer>
						<LinkContainer to="/map">
							<NavItem eventKey={1.3} href="/map">מיפוי הדרנטים מבוקרים</NavItem>
						</LinkContainer>
					</Nav>
					<Nav pullLeft>
						<NavDropdown eventKey={2} title="תפריט" id="user-nav-dropdown">
							<LinkContainer to="/download_app">
								<NavItem eventKey={2.1} href="/download_app">להתקנת אפליקציה</NavItem>
							</LinkContainer>
							<MenuItem divider />
							<LinkContainer to="/companies">
								<NavItem eventKey={2.2} href="/companies">תאגידים</NavItem>
							</LinkContainer>
							<MenuItem divider />
							<LinkContainer to="/users">
								<NavItem eventKey={2.3} href="/users">משתמשים</NavItem>
							</LinkContainer>
							<MenuItem divider />
							<LinkContainer to="/profile">
								<NavItem eventKey={2.4} href="/profile">פרופיל</NavItem>
							</LinkContainer>
							<MenuItem divider />
							<MenuItem eventKey={2.5} onClick={() => history.push('/logout')}>לצאת</MenuItem>
							<MenuItem divider />
							<MenuItem eventKey={2.6} onClick={() => handleFixture()}>איפוס</MenuItem>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
		</div>
	);
};

AuthenticatedNavigation.propTypes = {
	name: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedNavigation);

//
// <NavDropdown eventKey={2} title={name} id="user-nav-dropdown">
// 	<LinkContainer to="/profile">
// 		<NavItem eventKey={2.1} href="/profile">פרופיל</NavItem>
// 	</LinkContainer>
// 	<MenuItem divider />
// 	<MenuItem eventKey={2.2} onClick={() => history.push('/logout')}>לצאת</MenuItem>
// 	<MenuItem divider />
// 	<MenuItem eventKey={2.2} onClick={() => handleFixture() }>איפוס</MenuItem>
// </NavDropdown>






//
// <section id="sc1">
// 	<nav id="sc0">
// 		<ul>
// 			<li className={lhydrants}><Link to="/hydrants">מוצרים מותקנים</Link></li>
// 			<li className={levents}><Link to="/events">אירועים</Link></li>
// 			<li className={lmaps}><Link to="/map">מיפוי הדרנטים מבוקרים</Link></li>
// 		</ul>
// 	</nav>
// </section>
