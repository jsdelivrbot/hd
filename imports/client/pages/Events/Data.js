import React from 'react';
import { Table, Alert } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { compose, renderComponent, branch } from 'recompose';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import EventsCollection from '../../../api/Events/Events';

const Data = props => (
	<div className="Events">
		<Table responsive>
			<thead>
				<tr>
					<th>מספר הידרנט</th>
					<th>מספר ארוע</th>
					<th>תאריך</th>
					<th>קוד ארוע</th>
					<th>מידע</th>
					<th />
					<th />
				</tr>
			</thead>
			<tbody>
				{ props.data.map(d =>
					(
						<tr key={d._id}>
							<td>{d.hydrantId}</td>
							<td>{d.}</td>
							<td>{d.lat}</td>
							<td>{d.lon}</td>
							<td>{d.status}</td>
							<td>{d.lastComm}</td>
							<td>{d.address}</td>
							<td>{d.description}</td>
							<td>{(d.enabled) ? 'ON' : 'OFF'}</td>
						</tr>
					),
				)}
			</tbody>
		</Table>
	</div>
);

const NotFound = () => (<Alert bsStyle="warning">אין ארועים!</Alert>);

export default compose(
	meteorData(() => {
		const subscription = Meteor.subscribe('events');
		return {
			loading: !subscription.ready(),
			data: EventsCollection.find().fetch(),
		};
	}),
	branch(props => props.loading, renderComponent(Loading)),
	branch(props => !props.data.length, renderComponent(NotFound)),
)(Data);

