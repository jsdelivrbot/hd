import React from 'react';
import { Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import Data from './Data';
// import faker from 'faker'
import './css.scss';

const handleFixture = () => {
	// console.log(faker.date.past(10));
	// return 1;
	Meteor.call('db.init', (error) => {
		if (error) {
			console.log('error');
		} else {
			console.log('database zeroed');
		}
	});
};

const RenderHeader = props => (
	<div className="Events">
		<div className="page-header clearfix">
			<div className="pull-right"><h4>ארועים</h4></div>
		</div>
		<div>
			<Button
				bsStyle="primary"
				onClick={() => handleFixture()}
				block
			>
				Zero Database
			</Button>
		</div>
		<Data {...props} />
	</div>
);

export default RenderHeader;
