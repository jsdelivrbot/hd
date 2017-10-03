import React from 'react';
import {
	Alert,
	Button,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import {
	withHandlers,
	withProps,
	withStateHandlers,
	mapProps,
	setDisplayName,
	compose,
	renderComponent,
	branch,
} from 'recompose';
import withLog from '@hocs/with-log';
import { Link } from 'react-router-dom';
import {
	BootstrapTable,
	TableHeaderColumn,
} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import { resetSelected, setSelectedHydrants, getSelectedHydrants } from '../../Storage/Storage';
import SubManager from '../../../api/Utility/client/SubManager';

import '../../stylesheets/table.scss';

const NotFound = () => (<Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>);

export default compose(
	withStateHandlers(
		() => ({
			sort: { name: 'lastComm', order: -1 },
		}),
		{
			setSort: () => (name, order) => ({
				sort: {
					name,
					order: (order === 'asc') ? 1 : -1,
				}
			}),
		}
	),
	withHandlers({
		setSelected: () => (row, isSelected, e) => {
			setSelectedHydrants((isSelected) ? row._id : undefined);
		},
	}),
	meteorData((p) => {
		const name = p.sort.name;
		const order = p.sort.order;
		console.log(`name: ${name} order: ${order}`);
		const subscription = SubManager.subscribe('hydrants');
		const rawData = HydrantsCollection.find({}, { sort: { [name]: order } }).fetch();
		const oldGlobalArray = getSelectedHydrants();
		const newGlobalArray = [];
		const hNumbers = [];
		oldGlobalArray.forEach((global) => {
			const local = rawData.find(el => el._id === global._id);
			if (local) {
				newGlobalArray.push(local._id);
				hNumbers.push(local.number);
			}
		});
		resetSelected(newGlobalArray);
		console.log(`newGlobalArray: ${newGlobalArray}`);
		console.log(`hNumbers: ${hNumbers}`);
		return {
			selectedHydrants: hNumbers,
			rawData,
			loading: !subscription.ready(),
			nodata: !rawData.length,
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	branch(p => p.nodata, renderComponent(NotFound)),
	mapProps(({ rawData, ...p }) => {
		const proxy = new Proxy(rawData, {
			get(obj, prop) {
				if (isNaN(prop)) return obj[prop];
				const row = _.cloneDeep(obj[prop]);
				row.lastComm = _.replace((new Date(row.lastComm)).toLocaleString('he-IL'), ',', '');
				row.status = row.status ? 'פעיל' : 'מושבת';
				return row;
			},
		});
		return {
			data: proxy,
			...p,
		};
	}),
	withProps(p => ({
		options: {
			onSortChange: p.setSort,
			defaultSortName: p.sort.name,
			defaultSortOrder: (p.sort.order === 1) ? 'asc' : 'desc',
		},
	})),
	withLog((p) => { console.log(p); return ''; }),
	setDisplayName('Hydrants'),
)(
	(p) => {
		const sw = 55;
		const mw = 85;
		const lw = 200;
		const formatter = cell => (<span>{cell}</span>);
		console.log(p.selectedHydrants);
		const selectRowProp = {
			mode: 'checkbox',
			clickToSelect: true,
			bgColor: 'yellow',
			onSelect: p.setSelected,
			selected: [p.selectedHydrants],
		};
		return (
			<div className="Hydrants">
				<div style={{ height: 20 }} />
				<BootstrapTable selectRow={selectRowProp} containerClass="table_container_class" tableContainerClass="table_class" data={p.data} remote options={p.options} maxHeight="650px" striped hover>
					<TableHeaderColumn dataFormat={formatter} width={`${sw}px`} dataField="number" dataAlign="center" headerAlign="center" dataSort isKey>
						מספר
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${sw}px`} dataField="companyId" dataAlign="center" headerAlign="right" dataSort>
						מספר חברה
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${mw}px`} dataField="sim" dataAlign="center" headerAlign="center" dataSort>
						מספר סים
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${mw}px`} dataField="lat" dataAlign="center" headerAlign="center" dataSort>
						קו רוחב
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${mw}px`} dataField="lon" dataAlign="center" headerAlign="center" dataSort>
						קו אורך
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${sw}px`} dataField="status" dataAlign="center" headerAlign="center" dataSort>
						סטטוס
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${mw}px`} dataField="lastComm" dataAlign="center" headerAlign="right" dataSort>
						תקשורת אחרונה
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${lw}px`} dataField="address" dataAlign="center" headerAlign="center" dataSort>
						כתובת
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${lw}px`} dataField="description" dataAlign="center" headerAlign="center" dataSort>
						תאור
					</TableHeaderColumn>
				</BootstrapTable>
			</div>
		);
	});



//
// const handleRemove = (hydrantId) => {
// 	if (confirm('האם אתה בטוח? אין דרך חזרה...')) {
// 		Meteor.call('hydrants.remove', hydrantId, (error) => {
// 			if (error) {
// 				Bert.alert(error.reason, 'danger');
// 			} else {
// 				Bert.alert('&emsp;ההידרנט נמחק!', 'success', 'growl-top-left');
// 			}
// 		});
// 	}
// };
//

// // withLog(p => `props: ${JSON.stringify(p, null, 4)}`),
// <Link className="btn btn-success" to={`${match.url}/new`}>הוסף הידרנט</Link>
// <td>{(d.enabled) ? 'פעיל' : 'מושבת'}</td>
// <td>
// 	<Button
// 		bsStyle="primary"
// 		onClick={() => history.push(`${match.url}/${d._id}`)}
// 		block
// 	>
// 		פתח
// 	</Button>
// 	</td>
// 	<td>
// 		<Button
// 			bsStyle="danger"
// 			onClick={() => handleRemove(d._id)}
// 			block
// 		>
// 			מחק
// 		</Button>
// 	</td>
