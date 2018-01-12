import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';

import './Css/Navigation.scss';

const Navigation = (p) => {
	return (
		<div>
			<Link to="/">
				<img
					style={{ width: '100%' }}
					src="/top3.png"
					alt="logo"
				/>
			</Link>
			<div style={{ height: '15px' }} />
			<Navbar>
				{/*<Navbar.Collapse>*/}
				<If condition={p.isUserAdmin() || p.isUserControl()}>
					<Nav bsStyle="tabs" justified>
						<LinkContainer to="/hydrants">
							<NavItem eventKey={1.1} href="/hydrants">מוצרים מותקנים</NavItem>
						</LinkContainer>
						<LinkContainer to="/events">
							<NavItem eventKey={1.2} href="/events"><span  style={{ marginLeft: 20 }} className="glyphicon glyphicon-refresh"/><span>אירועים</span></NavItem>
						</LinkContainer>
						<LinkContainer to="/map">
							<NavItem eventKey={1.3} href="/map">מיפוי הדרנטים מבוקרים</NavItem>
						</LinkContainer>
					</Nav>
				</If>
				<Nav pullLeft>
					<NavDropdown eventKey={2} title="תפריט" id="user-nav-dropdown">
						<LinkContainer to="/download_app">
							<NavItem eventKey={2.1} href="/download_app">להתקנת אפליקציה</NavItem>
						</LinkContainer>
						<MenuItem divider />
						<If condition={p.isUserAdmin()}>
							<LinkContainer to="/companies">
								<NavItem eventKey={2.2} href="/companies">תאגידים</NavItem>
							</LinkContainer>
						</If>
						<If condition={p.isUserAdmin()}>
							<MenuItem divider />
						</If>
						<If condition={p.isUserAdmin()}>
							<LinkContainer to="/users">
								<NavItem eventKey={2.3} href="/users">משתמשים</NavItem>
							</LinkContainer>
						</If>
						<If condition={p.isUserAdmin()}>
							<MenuItem divider />
						</If>
						<LinkContainer to="/profile">
							<NavItem eventKey={2.4} href="/profile">פרופיל</NavItem>
						</LinkContainer>
						<MenuItem divider />
						<MenuItem eventKey={2.5} onClick={() => p.history.push('/logout')}>לצאת</MenuItem>
						<If condition={p.isUserAdmin()}>
							<MenuItem divider />
						</If>
						<If condition={p.isUserAdmin()}>
							<MenuItem eventKey={2.6} onClick={() => Meteor.callPromise('utility.db.reset')}>איפוס</MenuItem>
						</If>
						<If condition={p.isUserAdmin()}>
							<MenuItem divider />
						</If>
						<If condition={p.isUserAdmin()}>
							<MenuItem eventKey={2.6} onClick={() => Meteor.callPromise('utility.db.init')}>פיקטיבי</MenuItem>
						</If>
					</NavDropdown>
				</Nav>
				{/*</Navbar.Collapse>*/}
			</Navbar>
		</div>
	);
};

export default withRouter(Navigation);
