
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
import Loader from 'react-loader-advanced';

import { Button } from 'react-bootstrap';
import '../../../stylesheets/table.scss';
import './Css/ViewHydrant.scss';

import Loading from '../../../components/LoginLayoutNavigation/Loading/Loading';
import Map from '../../../components/Map/Map';
import Events from '../../../components/Events/Events';

import { removeLastSlash } from '../../../Utils/Utils';

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
			await p.loadData();
			p.setInitialized(true);
		},

	}),
	withHandlers({
		zeroStatus: p => async () => {
			await Meteor.callPromise('hydrants.zero.status', { _id: p._id });
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
				<Loader show={p.loading} message={Loading()} backgroundStyle={{ backgroundColor: 'transparent' }}>
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
				</Loader>
				<div>
					<Flex pt={2} pb={2}>
						<Box w={1}>
							<If condition={p.isUserControl()}>
								<Button
									bsStyle="primary" block
									onClick={() => {
										p.setHydrantEdited(true);
										p.zeroStatus();
									}}
								>אפס סטטוס</Button>
							</If>
						</Box>
						<Box w={1} />
						<Box w={1}>
							<If condition={p.isUserAdmin()}>
								<Button
									bsStyle="primary" block
									onClick={() => {
										p.setHydrantEdited(true);
										p.history.push(`${removeLastSlash(p.match.url)}/edit`);
									}}
								>ערוך</Button>
							</If>
						</Box>
					</Flex>
				</div>
				<Events _id={p._id} types={p.types} company={p.company} />
				<Flex pt={2} pb={2} />
				<Map _id={p._id} types={p.types} company={p.company} />
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

