import React from 'react';
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
import _ from 'lodash';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Segment } from 'semantic-ui-react';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../../stylesheets/table.scss';

import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import { resetSelected, setSelectedHydrants, getSelectedHydrants, setHydrantFilter } from '../../Storage/Storage';
import SubManager from '../../../api/Utility/client/SubManager';

export default compose(
	withStateHandlers(
		() => ({
			sort: { name: 'lastComm', order: -1 },
			filter: {
				status: {
					type: {
						1: 'פעיל',
						0: 'מושבת',
					},
					value: undefined,
				}
			},
		}), {
			setSort: () => (name, order) => ({
				sort: {
					name,
					order: (order === 'asc') ? 1 : -1,
				}
			}),
			setFilter: ({ filter }) => (filterObj) => {
				const nextFilter = _.clone(filter);
				nextFilter.status.value = _.get(filterObj, 'status.value', undefined);
				setHydrantFilter('status', nextFilter.status.value);
				return { filter: nextFilter };
			},
		}
	),
	meteorData((p) => {
		const subscription = SubManager.subscribe('hydrants');
		const filter = {};
		if (!_.isUndefined(p.filter.status.value)) filter.status = Number(p.filter.status.value);
		const rawData = HydrantsCollection.find(filter,
			{ sort: { [p.sort.name]: p.sort.order } })
			.fetch();
		return {
			rawData,
			loading: !subscription.ready(),
			nodata: !rawData.length,
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	// branch(p => p.nodata, renderComponent(NotFound)),
	mapProps(({ rawData, ...p }) => ({
		data: _.cloneDeep(rawData.map(({ lastComm, status, ...row }) => ({
			lastComm: _.replace((new Date(lastComm)).toLocaleString('he-IL'), ',', ''),
			status: p.filter.status.type[status],
			...row,
		}))),
		activeUnits: _.filter(rawData, ['status', 1]).length,
		disabledUnits: _.filter(rawData, ['status', 0]).length,
		totalUnits: rawData.length,
		...p,
	})),
	withHandlers({
		setSelected: () => (row, isSelected) => {
			setSelectedHydrants(row._id, isSelected);
		},
		setAllSelected: () => (isSelected, rows) => {
			setSelectedHydrants(rows.map(el => el._id), isSelected);
		},
	}),
	withProps(p => ({
		options: {
			onSortChange: p.setSort,
			defaultSortName: p.sort.name,
			defaultSortOrder: (p.sort.order === 1) ? 'asc' : 'desc',
			onFilterChange: p.setFilter,
		},
		selectRowProp: {
			mode: 'checkbox',
			clickToSelect: true,
			bgColor: 'yellow',
			onSelect: p.setSelected,
			onSelectAll: p.setAllSelected,
			selected: resetSelected(getSelectedHydrants().filter(id => p.data.find(row => row._id === id))),
		},
	})),
	withLog((p) => { console.log(p); return ''; }),
	setDisplayName('Hydrants'),
)(
	(p) => {
		console.log('rendering');
		const sw = 50;
		const mw = 95;
		const lw = 150;
		const formatter = cell => (<span>{cell}</span>);
		const currentDate = _.replace((new Date()).toLocaleString('he-IL'), ',', '');
		return (
			<div className="Hydrants">
				<div style={{ height: 20 }} />
				<BootstrapTable keyField="_id" selectRow={p.selectRowProp} containerClass="table_container_class" tableContainerClass="table_class" data={p.data} remote options={p.options} height="600px" striped hover>
					<TableHeaderColumn dataFormat={formatter} width="75px" dataField="number" dataAlign="center" headerAlign="center" dataSort>
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
					<TableHeaderColumn
						filterFormatted
						dataFormat={formatter}
						filter={{ type: 'SelectFilter', options: p.filter.status.type, selectText: 'בחר' }}
						width="135px"
						dataField="status"
						dataAlign="center"
						headerAlign="center"
						dataSort
					>
						סטטוס
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width={`${mw}px`} dataField="lastComm" dataAlign="center" headerAlign="right" dataSort>
						תקשורת אחרונה
					</TableHeaderColumn>
					<TableHeaderColumn width={`${lw}px`} dataFormat={formatter} dataField="address" dataAlign="center" headerAlign="center" dataSort>
						כתובת
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} dataField="description" dataAlign="center" headerAlign="center" dataSort>
						תאור
					</TableHeaderColumn>
				</BootstrapTable>
				<Segment raised textAlign="center" size="big">
					סה&quot;כ מוצרים מותקנים על הידרנטים ברחבי תאגיד עין אפק:  {p.totalUnits} יח&#39;<br />
					מתוכם: {p.activeUnits} יח&#39; פעילים        {p.disabledUnits} יח&#39; מושבתים<br />
					נכון לתאריך: {currentDate}
				</Segment>
			</div>
		);
	});

// const NotFound = () => (<Alert bsStyle="warning">אין הידרנטים עדיין</Alert>);

// mapProps(({ rawData, ...p }) => {
// 	const proxy = new Proxy(rawData, {
// 		get(obj, prop) {
// 			if (isNaN(prop)) return obj[prop];
// 			const row = _.cloneDeep(obj[prop]);
// 			row.lastComm = _.replace((new Date(row.lastComm)).toLocaleString('he-IL'), ',', '');
// 			row.status = row.status ? 'פעיל' : 'מושבת';
// 			return row;
// 		},
// 	});
// 	return {
// 		data: proxy,
// 		...p,
// 	};
// }),

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
