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

const AuthenticatedNavigation = ({ name, history }) => (
	<div>
		<Link to="/">
			<img
				style={{ width: '100%' }}
				src="top3.png"
				alt="logo"
			/>
		</Link>
		<div style={{ height: '15px' }} />
		<Navbar style={{ width: '1170', marginRight: 'auto', marginLeft: 'auto' }}>
			<Navbar.Header>
				<Navbar.Toggle />
			</Navbar.Header>
			<Navbar.Collapse>
				<Nav bsStyle="tabs" justified>
					<LinkContainer to="/hydrants">
						<NavItem eventKey={1.1} href="/hydrants">מוצרים מותקנים</NavItem>
					</LinkContainer>
					<LinkContainer to="/events">
						<NavItem eventKey={1.2} href="/events">אירועים</NavItem>
					</LinkContainer>
					<LinkContainer to="/map">
						<NavItem eventKey={1.3} href="/events">מיפוי הדרנטים מבוקרים</NavItem>
					</LinkContainer>
				</Nav>
				<Nav pullLeft>
					<NavDropdown eventKey={2} title={name} id="user-nav-dropdown">
						<LinkContainer to="/profile">
							<NavItem eventKey={2.1} href="/profile">פרופיל</NavItem>
						</LinkContainer>
						<MenuItem divider />
						<MenuItem eventKey={2.2} onClick={() => history.push('/logout')}>לצאת</MenuItem>
						<MenuItem divider />
						<MenuItem eventKey={2.2} onClick={() => handleFixture() }>איפוס</MenuItem>
					</NavDropdown>
				</Nav>
				<Nav pullLeft>
					<LinkContainer to="/download_app">
						<NavItem eventKey={1.4} href="/download_app">להתקנת אפליקציה</NavItem>
					</LinkContainer>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	</div>
);

AuthenticatedNavigation.propTypes = {
	name: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedNavigation);
