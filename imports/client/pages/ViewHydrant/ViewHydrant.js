
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
	withHandlers,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
} from 'recompose';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import { Flex, Box } from 'reflexbox';
import moment from 'moment';

import { Button } from 'react-bootstrap';
import '../../stylesheets/table.scss';
import './Css/ViewHydrant.scss';

import Loading from '../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';

import {
	getStore as getStoreHydrantsPage,
	setStore as setStoreHydrantsPage,
	reactiveVar,
} from '../../Storage/Storage';

const getStore = keys => getStoreHydrantsPage('hydrantPage', keys);
const setStore = obj => setStoreHydrantsPage('hydrantsPage', obj);

export default compose(
	withStateHandlers(
		() => ({
			types: undefined,
			data: [],
			loading: false,
			initialized: false,
		}), {
			setTypes: () => types => setStore({ types }),
			setLoading: () => loading => ({ loading }),
			setData: () => data => ({ data }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			console.log('initializing');
			p.setLoading(true);
			let types = getStore('types');
			if (!types) types = await Meteor.callPromise('get.types');
			p.setTypes(types);
			const data = await Meteor.callPromise('hydrants.get.data.one', { filter: { _id: p.match.params._id } });
			data.createdAt = moment(data.createdAt).format('DD.MM.YYYY');
			data.status = types.status[data.status];
			p.setData([data]);
			p.setLoading(false);
			p.setInitialized(true);
		},

	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering');
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
					<Button
						bsStyle="primary"
						onClick={() => p.history.push(`${p.match.url}/edit`)}
						block
					>
						ערוך
					</Button>
				</div>
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

