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
	lifecycle,
} from 'recompose';
import withLog from '@hocs/with-log';
import _ from 'lodash';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Segment } from 'semantic-ui-react';
import moment from 'moment';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../../stylesheets/table.scss';

import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import {
	resetSelected,
	setSelectedHydrants,
	getSelectedHydrants,
	setHydrantFilter,
	getHydrantFilter,
	getHydrantSort,
	setHydrantSort,
	getHydrantFindFilter,
} from '../../Storage/Storage';
import SubManager from '../../../api/Utility/client/SubManager';

export default compose(
	withStateHandlers(
		() => ({
			sort: getHydrantSort(),
			filter: {
				status: {
					type: {
						1: 'פעיל',
						0: 'מושבת',
					},
					value: getHydrantFilter().status,
				},
				createdAt: {
					type: {
						0: 'יממה',
						1: 'שבוע',
						2: 'חודש',
						3: 'רבעון',
						4: 'שנה',
					},
					value: getHydrantFilter().createdAt,
				},
			},
		}), {
			setSort: () => (name, order) => {
				const sort = {
					name,
					order: (order === 'asc') ? 1 : -1,
				};
				setHydrantSort(sort);
				return { sort };
			},
			setFilter: ({ filter }) => (filterObj) => {
				const nextFilter = _.clone(filter);

				let status = _.get(filterObj, 'status.value', undefined);
				status = status ? _.toNumber(status) : undefined;
				let createdAt = _.get(filterObj, 'createdAt.value', undefined);
				createdAt = createdAt ? _.toNumber(createdAt) : undefined;

				setHydrantFilter('status', status);
				nextFilter.status.value = status;
				setHydrantFilter('createdAt', createdAt);
				nextFilter.createdAt.value = createdAt;

				return {
					filter: nextFilter
				};
			},
		}
	),
	meteorData((p) => {
		const filter = getHydrantFindFilter({
			addDate: true,
			addStatus: true,
			dateKey: p.filter.createdAt.value,
			statusKey: p.filter.status.value,
		});

		const subscription = SubManager.subscribe('hydrants');
		const rawData = HydrantsCollection.find(
			filter,
			{ sort: { [p.sort.name]: p.sort.order } })
			.fetch();
		return {
			rawData,
			loading: !subscription.ready(),
			nodata: !rawData.length,
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	mapProps(({ rawData, ...p }) => ({
		data: _.cloneDeep(rawData.map(({ createdAt, status, ...row }) => ({
			createdAt: moment(createdAt).format('DD.MM.YYYY'),
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
			bgColor: 'green',
			onSelect: p.setSelected,
			onSelectAll: p.setAllSelected,
			selected: resetSelected(getSelectedHydrants().filter(id => p.data.find(row => row._id === id))),
		},
	})),
	// withLog((p) => { console.log(p); return ''; }),
	setDisplayName('Hydrants'),
)(
	(p) => {
		console.log('rendering');
		const sw = 50;
		const mw = 95;
		const lw = 150;
		const formatter = (cell) => {
			let style = {};
			if (cell === p.filter.status.type[0]) {
				style = { color: '#ff0000' };
			} else if (cell === p.filter.status.type[1]) {
				style = { color: '#0000ff' };
			}
			return (
				<span
					style={style}
				>
					{cell}
				</span>
			);
		};
		const currentDate = (new Date()).toLocaleString('he-IL').split(',')[0];
		const getCustomFilter = (filterHandler) => {
			console.log(filterHandler);
			return (
				<div>
					<input ref='nokCheckbox' type="checkbox" className="filter" onChange={ () => console.log('changed') } defaultChecked={ true } style={ { marginLeft: 30 + 'px' } } /><label>label</label>
				</div>
			);
		};
		return (
			<div className="Hydrants">
				<div style={{ height: 20 }} />
				<BootstrapTable
					keyField="_id"
					selectRow={p.selectRowProp}
					containerClass="table_container_class"
					tableContainerClass="table_class"
					data={p.data}
					remote
					options={p.options}
					height="600px"
					striped
					hover
				>
					<TableHeaderColumn dataFormat={formatter} width="75px" dataField="number" dataAlign="left" headerAlign="center" dataSort>
						מספר מזהה
					</TableHeaderColumn>
					<TableHeaderColumn
						filterFormatted
						dataFormat={formatter}
						filter={{
							type: 'CustomFilter',
							getElement: getCustomFilter,
							options: p.filter.status.type,
							selectText: 'בחר',
							defaultValue: p.filter.status.value,
						}}
						width="135px"
						dataField="status"
						dataAlign="center"
						headerAlign="center"
						dataSort
					>
						סטטוס
					</TableHeaderColumn>
					<TableHeaderColumn
						dataField="createdAt"
						width={`${mw}px`}
						dataAlign="center"
						headerAlign="center"
						dataSort
						filterFormatted
						dataFormat={formatter}
						filter={{
							type: 'SelectFilter',
							options: p.filter.createdAt.type,
							selectText: 'בחר',
							defaultValue: p.filter.createdAt.value,
						}}
					>
						תאריך התקנה
					</TableHeaderColumn>
					<TableHeaderColumn width={`${lw}px`} dataFormat={formatter} dataField="address" dataAlign="right" headerAlign="center" dataSort>
						כתובת ההתקנה
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} dataField="description" dataAlign="right" headerAlign="center" dataSort>
						תאור מקום
					</TableHeaderColumn>
				</BootstrapTable>
				<Segment style={{ marginTop: '20px' }} raised textAlign="center" size="big">
					סה&quot;כ מוצרים מותקנים על הידרנטים ברחבי תאגיד עין אפק:  {p.totalUnits} יח&#39;<br />
					מתוכם: {p.activeUnits} יח&#39; פעילים        {p.disabledUnits} יח&#39; מושבתים<br />
					נכון לתאריך: {currentDate}
				</Segment>
			</div>
		);
	});


// lifecycle({
// 	componentDidUpdate(prevProps) {
// 		// console.log(_.isEqual(this.props, prevProps));
// 		_.forEach(this.props, (value, key) => {
// 			console.log(key);
// 			console.log(this.props[key]===prevProps[key]);
// 		});
// 	}
// }),

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
