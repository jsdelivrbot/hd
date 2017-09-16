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

const handleRemove = (hydrantId) => {
	if (confirm('האם אתה בטוח? אין דרך חזרה...')) {
		Meteor.call('hydrants.remove', hydrantId, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('ההידרנט נמחק!', 'success');
			}
		});
	}
};

const Hydrants = ({ loading, hydrants, match, history }) => (!loading ? (
	<div className="Hydrants">
		<div className="page-header clearfix">
			<div className="pull-right"><h4>הידרנטים</h4></div>
			<div><Link className="btn btn-success pull-left" to={`${match.url}/new`}>הוסף הידרנט</Link></div>
		</div>
		{hydrants.length ? <Table responsive>
			<thead>
				<tr>
					<th>מספר הידרנט</th>
					<th>מספר סים</th>
					<th>קו רוחב</th>
					<th>קו אורך</th>
					<th>סטטוס</th>
					<th>תקשורת אחרונה</th>
					<th>כתובת</th>
					<th>תאור</th>
					<th>מאופשר</th>
					<th />
					<th />
				</tr>
			</thead>
			<tbody>
				{ hydrants.map(
					({ _id, number, sim, companyId, lat, lon,
						status, lastComm, address, description, enabled }) =>
						(
							<tr key={_id}>
								<td>{number}</td>
								<td>{sim}</td>
								<td>{lat}</td>
								<td>{lon}</td>
								<td>{status}</td>
								<td>{lastComm}</td>
								<td>{address}</td>
								<td>{description}</td>
								<td>{enabled}</td>
								<td>
									<Button
										bsStyle="primary"
										onClick={() => history.push(`${match.url}/${_id}`)}
										block
									>
										פתח
									</Button>
								</td>
								<td>
									<Button
										bsStyle="danger"
										onClick={() => handleRemove(_id)}
										block
									>
										מחק
									</Button>
								</td>
							</tr>
						)
					,
				)}
			</tbody>
		</Table> : <Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>}
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
