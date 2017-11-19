
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
	withHandlers,
} from 'recompose';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import { Flex, Box } from 'reflexbox';
import moment from 'moment';

import { Button } from 'react-bootstrap';
import '../../../stylesheets/table.scss';
import './Css/ViewHydrant.scss';

import Loading from '../../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';
import Map from '../../../components/Map/Map';
import Events from '../../../components/Events/Events';

export default compose(
	withStateHandlers(
		p => ({
			_id: p.match.params._id,
			data: [],
			loading: false,
			initialized: false,
		}), {
			setLoading: () => loading => ({ loading }),
			setData: () => data => ({ data }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	withHandlers({
		loadData: p => async () => {
			p.setLoading(true);

			const data = await Meteor.callPromise('hydrants.get.data.one', { filter: { _id: p._id } });
			data.createdAt = moment(data.createdAt).format('DD.MM.YYYY');
			data.status = p.types.status[data.status];
			p.setData([data]);

			p.setLoading(false);
		},
	}),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			console.log('initializing');
			await p.loadData();
			p.setInitialized(true);
		},

	}),
	withHandlers({
		zeroStatus: p => async () => {
			console.log('here1');
			await Meteor.callPromise('hydrants.zero.status', { _id: p._id });
			console.log('here2');
			p.loadData();
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering ViewHydrant');
		const formatter = cell => (<span>{cell}</span>);

		return (
			<div className="viewHydrant">
				<BootstrapTable
					containerClass="table_container_class"
					tableContainerClass="table_class"
					data={p.data}
				>
					<TableHeaderColumn
						isKey
						dataFormat={formatter}
						width="125px"
						dataField="number"
						dataAlign="left"
						headerAlign="center"
					>
						מספר מזהה
					</TableHeaderColumn>
					<TableHeaderColumn
						dataFormat={formatter}
						width="135px"
						dataField="status"
						dataAlign="center"
						headerAlign="center"
					>
						סטטוס
					</TableHeaderColumn>
					<TableHeaderColumn
						dataField="createdAt"
						width="155"
						dataFormat={formatter}
						dataAlign="center"
						headerAlign="center"
					>
						תאריך התקנה
					</TableHeaderColumn>
					<TableHeaderColumn
						width="200"
						dataFormat={formatter}
						dataField="address"
						dataAlign="right"
						headerAlign="center"
					>
						כתובת ההתקנה
					</TableHeaderColumn>
					<TableHeaderColumn
						dataFormat={formatter}
						dataField="description"
						dataAlign="right"
						headerAlign="center"
					>
						תאור מקום
					</TableHeaderColumn>
				</BootstrapTable>
				<div>
					<Flex>
						<Box w={1}>
							{p.isUserControl() ?
								<Button
									bsStyle="primary" block
									onClick={p.zeroStatus}
								>אפס סטטוס</Button>
								:
								''
							}
						</Box>
						<Box w={1} />
						<Box w={1}>
							{p.isUserAdmin() ?
								<Button
									bsStyle="primary" block
									onClick={() => p.history.push(`${p.match.url}/edit`)}
								>ערוך</Button>
								:
								''
							}
						</Box>
					</Flex>
				</div>
				<Events _id={p._id} types={p.types} />
				<Map _id={p._id} types={p.types} />
			</div>
		);
	});


//
// const handleRemove = (hydrantId, history) => {
// 	if (confirm('האם אתה בטוח? אין דרך חזרה!')) {
// 		Meteor.call('hydrants.remove', hydrantId, (error) => {
// 			if (error) {
// 				Bert.alert(error.reason, 'danger');
// 			} else {
// 				Bert.alert('&emsp;הידרנט נמחק!', 'success', 'growl-top-left');
// 				history.push('/hydrants');
// 			}
// 		});
// 	}
// };

