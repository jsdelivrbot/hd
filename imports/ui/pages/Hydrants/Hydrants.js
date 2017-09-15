import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import Loading from '../../components/Loading/Loading';

import './Hydrants.scss';

const handleRemove = (documentId) => {
	if (confirm('Are you sure? This is permanent!')) {
		Meteor.call('hydrants.remove', documentId, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('Hydrant deleted!', 'success');
			}
		});
	}
};

const Hydrants = ({ loading, hydrants, match, history }) => (!loading ? (
	<div className="Hydrants">
		<div className="page-header clearfix">
			<h4 className="pull-right">Hydrants</h4>
			<Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Hydrant</Link>
		</div>
		{hydrants.length ? <Table responsive>
			<thead>
				<tr>
					<th>Title</th>
					<th>Last Updated</th>
					<th>Created</th>
					<th />
					<th />
				</tr>
			</thead>
			<tbody>
				{hydrants.map(({ _id, title, createdAt, updatedAt }) => (
					<tr key={_id}>
						<td>{title}</td>
						<td>{timeago(updatedAt)}</td>
						<td>{monthDayYearAtTime(createdAt)}</td>
						<td>
							<Button
								bsStyle="primary"
								onClick={() => history.push(`${match.url}/${_id}`)}
								block
							>View</Button>
						</td>
						<td>
							<Button
								bsStyle="danger"
								onClick={() => handleRemove(_id)}
								block
							>Delete</Button>
						</td>
					</tr>
				))}
			</tbody>
		</Table> : <Alert bsStyle="warning">No hydrants yet!</Alert>}
	</div>
) : <Loading />);

Hydrants.propTypes = {
	loading: PropTypes.bool.isRequired,
	hydrants: PropTypes.arrayOf(PropTypes.object).isRequired,
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default createContainer(() => {
	const subscription = Meteor.subscribe('hydrants');
	return {
		loading: !subscription.ready(),
		hydrants: HydrantsCollection.find().fetch(),
	};
}, Hydrants);
