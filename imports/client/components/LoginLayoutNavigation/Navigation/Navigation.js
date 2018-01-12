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
				{/*</Navbar.Collapse>*/}
			</Navbar>
		</div>
	);
};

export default withRouter(Navigation);
