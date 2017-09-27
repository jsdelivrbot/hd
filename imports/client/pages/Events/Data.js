import React from 'react';
import { Table, Alert } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { compose, renderComponent, branch } from 'recompose';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import EventsCollection from '../../../api/Events/Events';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';

const ifitis = (object, property, otherwise) => (object ? object[property] : otherwise);

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
				{ props.eventsData.map(d =>
					(
						<tr key={d._id}>
							<td>
								{ifitis(props.hydrantsData.find(record => record._id === d.hydrantId), 'number', '?')}
							</td>
							<td>{d.number}</td>
							<td>{d.createdAt}</td>
							<td>{d.code}</td>
							<td>{d.edata}</td>
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
		const subscription1 = Meteor.subscribe('events');
		const subscription2 = Meteor.subscribe('hydrants');
		// console.log(`subscription1: ${subscription1.ready()}`);
		// console.log(`subscription2: ${subscription2.ready()}`);
		return {
			loading: !subscription1.ready() || !subscription2.ready(),
			hydrantsData: HydrantsCollection.find().fetch(),
			eventsData: EventsCollection.find().fetch(),
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	branch(p => (!p.eventsData.length || !p.hydrantsData.length), renderComponent(NotFound)),
)(Data);

