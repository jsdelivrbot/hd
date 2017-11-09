
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
} from 'recompose';

import { Bert } from 'meteor/themeteorchef:bert';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import { Flex, Box } from 'reflexbox';
import moment from 'moment';

import { Button } from 'react-bootstrap';
import '../../../stylesheets/table.scss';
import './Css/ViewCompany.scss';

import Loading from '../../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';

const handleRemove = (_id, history) => {
	if (confirm('האם אתה בטוח? אין דרך חזרה!')) {
		Meteor.call('companies.remove', _id, (error) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert('&emsp;החברה נמחקה!', 'success', 'growl-top-left');
				history.push('/companies');
			}
		});
	}
};

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
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			console.log('initializing');
			p.setLoading(true);

			const data = await Meteor.callPromise('companies.get.data.one', { filter: { _id: p._id } });
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
			<div className="ViewCompany">
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
						width="125"
						dataFormat={formatter}
						dataField="name"
						dataAlign="right"
						headerAlign="center"
					>
						שם
					</TableHeaderColumn>
					<TableHeaderColumn
						width="150"
						dataFormat={formatter}
						dataField="address"
						dataAlign="right"
						headerAlign="center"
					>
						כתובת
					</TableHeaderColumn>
					<TableHeaderColumn
						dataFormat={formatter}
						dataField="contactPerson"
						dataAlign="right"
						headerAlign="center"
					>
						שם איש קשר
					</TableHeaderColumn>
				</BootstrapTable>
				<div>
					<Flex>
						<Box w={1}>
							<Button
								bsStyle="primary"
								onClick={() => p.history.push(`${p.match.url}/edit`)}
								block
							>ערוך</Button>
						</Box>
						<Box w={1} />
						<Box w={1}>
							<Button
								bsStyle="primary"
								onClick={() => handleRemove(p._id, p.hystory)}
								block
							>מחק</Button>
						</Box>
					</Flex>
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

