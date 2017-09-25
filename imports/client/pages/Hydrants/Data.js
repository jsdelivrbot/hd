import React from 'react';
import { Table, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { compose, renderComponent, branch } from 'recompose';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';

const handleRemove = (hydrantId) => {
	if (confirm('האם אתה בטוח? אין דרך חזרה...')) {
		Meteor.call('hydrants.remove', hydrantId, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('&emsp;ההידרנט נמחק!', 'success', 'growl-top-left');
			}
		});
	}
};

const Data = props => (
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
				{ props.data.map(d =>
					(
						<tr key={d._id}>
							<td>{d.number}</td>
							<td>{d.companyId}</td>
							<td>{d.sim}</td>
							<td>{d.lat}</td>
							<td>{d.lon}</td>
							<td>{d.status}</td>
							<td>{d.lastComm}</td>
							<td>{d.address}</td>
							<td>{d.description}</td>
							<td>{(d.enabled) ? 'ON' : 'OFF'}</td>
							<td>
								<Button
									bsStyle="primary"
									onClick={() => props.history.push(`${props.match.url}/${d._id}`)}
									block
								>
									פתח
								</Button>
							</td>
							<td>
								<Button
									bsStyle="danger"
									onClick={() => handleRemove(d._id)}
									block
								>
									מחק
								</Button>
							</td>
						</tr>
					),
				)}
			</tbody>
		</Table>
	</div>
);

const NotFound = () => (<Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>);

export default compose(
	meteorData(() => {
		const subscription = Meteor.subscribe('hydrants');
		return {
			loading: !subscription.ready(),
			data: HydrantsCollection.find().fetch(),
		};
	}),
	branch(props => props.loading, renderComponent(Loading)),
	branch(props => !props.data.length, renderComponent(NotFound)),
)(Data);

