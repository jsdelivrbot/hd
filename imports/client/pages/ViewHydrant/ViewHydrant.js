import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'react-bootstrap';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Hydrants from '../../../api/Hydrants/Hydrants';
import NotFound from '../NotFound/NotFound';
import Loading from '../../components/Loading/Loading';

const handleRemove = (hydrantId, history) => {
	if (confirm('האם אתה בטוח? אין דרך חזרה!')) {
		Meteor.call('hydrants.remove', hydrantId, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('&emsp;הידרנט נמחק!', 'success', 'growl-top-left');
				history.push('/hydrants');
			}
		});
	}
};

const renderHydrant = (doc, match, history) => (doc ? (
	<div className="Hydrants">
		<Table responsive>
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
				<tr >
					<td>{doc.number}</td>
					<td>{doc.sim}</td>
					<td>{doc.lat}</td>
					<td>{doc.lon}</td>
					<td>{doc.status}</td>
					<td>{doc.lastComm}</td>
					<td>{doc.address}</td>
					<td>{doc.description}</td>
					<td>{(doc.enabled) ? 'ON' : 'OFF'}</td>
					<td>
						<Button
							bsStyle="primary"
							onClick={() => history.push(`${match.url}/edit`)}
							block
						>
							ערוך
						</Button>
					</td>
					<td>
						<Button
							bsStyle="danger"
							onClick={() => handleRemove(doc._id, history)}
							block
						>
							מחק
						</Button>
					</td>
				</tr>
			</tbody>
		</Table>
	</div>
) : <NotFound />);

const ViewHydrant = ({ loading, doc, match, history }) => (
	!loading ? renderHydrant(doc, match, history) : <Loading />
);

ViewHydrant.propTypes = {
	loading: PropTypes.bool.isRequired,
	doc: PropTypes.object,
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
	const hydrantId = match.params._id;
	const subscription = Meteor.subscribe('hydrants.view', hydrantId);

	return {
		loading: !subscription.ready(),
		doc: Hydrants.findOne(hydrantId),
	};
}, ViewHydrant);
