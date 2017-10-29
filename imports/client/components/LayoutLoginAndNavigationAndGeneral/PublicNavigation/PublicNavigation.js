import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, NavItem } from 'react-bootstrap';

const PublicNavigation = () => (
	<Nav pullRight>
		<LinkContainer to="/signup">
			<NavItem eventKey={1} href="/signup">הירשם</NavItem>
		</LinkContainer>
		<LinkContainer to="/login">
			<NavItem eventKey={2} href="/login">היכנס</NavItem>
		</LinkContainer>
	</Nav>
);

export default PublicNavigation;
