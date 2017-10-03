import React from 'react';
import PropTypes from 'prop-types';
import { compose, renderComponent, branch } from 'recompose';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import { Button, Table } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Hydrants from '../../../api/Hydrants/Hydrants';
import NotFound from '../../components/NotFound/NotFound';


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

const renderHydrant = ({ d, match, history }) => (
	<div className="HydrantView">
		<Table responsive>
			<thead>
				<tr>
					<th>מספר חברה</th>
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
					<td>{d.companyId}</td>
					<td>{d.number}</td>
					<td>{d.sim}</td>
					<td>{d.lat}</td>
					<td>{d.lon}</td>
					<td>{d.status}</td>
					<td>{d.lastComm}</td>
					<td>{d.address}</td>
					<td>{d.description}</td>
					<td>{(d.enabled) ? 'פעיל' : 'מושבת'}</td>
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
							onClick={() => handleRemove(d._id, history)}
							block
						>
							מחק
						</Button>
					</td>
				</tr>
			</tbody>
		</Table>
	</div>
);

export default compose(
	meteorData(({ match }) => {
		const hydrantId = match.params._id;
		const subscription = Meteor.subscribe('hydrants.view', hydrantId);
		return {
			loading: !subscription.ready(),
			d: Hydrants.findOne(hydrantId),
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	branch(p => !p.d, renderComponent(NotFound)),
)(renderHydrant);
