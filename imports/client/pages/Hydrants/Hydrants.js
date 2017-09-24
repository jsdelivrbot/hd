import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { compose, renderComponent, branch } from 'recompose';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import { Bert } from 'meteor/themeteorchef:bert';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';

import './Hydrants.scss';

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

const RenderData = ({ data, match, history }) => (
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
				{ data.map(
					({ _id, number, sim, lat, lon,
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
								<td>{(enabled) ? 'ON' : 'OFF'}</td>
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
						),
				)}
			</tbody>
		</Table>
	</div>
);

const NotFound = () => (<Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>);

const RRenderData = compose(
	meteorData(() => {
		const subscription = Meteor.subscribe('hydrants');
		return {
			loading: !subscription.ready(),
			data: HydrantsCollection.find().fetch(),
		};
	}),
	branch(props => props.loading, renderComponent(Loading)),
	branch(props => !props.data.length, renderComponent(NotFound)),
)(RenderData);

const renderHeader = props => (
	<div className="Hydrants">
		<div className="page-header clearfix">
			<div className="pull-right"><h4>הידרנטים</h4></div>
			<div><Link className="btn btn-success pull-left" to={`${props.match.url}/new`}>הוסף הידרנט</Link></div>
		</div>
		<RRenderData {...props} />
	</div>
);

export default renderHeader;

// export default compose(
// 	withProps(
// 		compose(
// 			meteorData(() => {
// 				const subscription = Meteor.subscribe('hydrants');
// 				return {
// 					loading: !subscription.ready(),
// 					data: HydrantsCollection.find().fetch(),
// 				};
// 			}),
// 			branch(props => props.loading, renderComponent(Loading)),
// 			branch(props => !props.data.length,
// 				renderComponent(() => (<Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>))),
// 		)(RenderData),
// 	),
// )(renderHeader);
