/* eslint-disable no-param-reassign */

import React from 'react';
import {
	mapProps,
	setDisplayName,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	withProps,
} from 'recompose';
import withLog from '@hocs/with-log';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import { Segment } from 'semantic-ui-react';

import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import EventsCollection from '../../../api/Events/Events';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import SubManager from '../../../api/Utility/client/SubManager';
import {
	getHydrantFindFilter,
	getEventSort,
	getEventFilter,
	setEventSort,
	setEventFilter,
	getEventFindFilter,
} from '../../Storage/Storage';

import '../../stylesheets/table.scss';

export default compose(
	withStateHandlers(
		() => ({
			sort: getEventSort(),
			filter: {
				code: {
					type: {
						0: 'OK',
						1: 'בטריה ריקה',
						2: 'התעללות',
						3: 'תחילת זרימה רגילה',
						4: 'המשך זרימה רגילה',
						5: 'סיום זרימה רגילה',
						6: 'תחילת זרימה הפוכה',
						7: 'סיום זרימה הפוכה',
					},
					value: getEventFilter().code,
				},
				createdAt: {
					type: {
						0: 'יממה',
						1: 'שבוע',
						2: 'חודש',
						3: 'רבעון',
						4: 'שנה',
					},
					value: getEventFilter().createdAt,
				},
			},
		}), {
			setSort: () => (name, order) => {
				const sort = {
					name,
					order: (order === 'asc') ? 1 : -1,
				};
				setEventSort(sort);
				return { sort };
			},
			setFilter: ({ filter }) => (filterObj) => {
				const nextFilter = _.clone(filter);

				let code = _.get(filterObj, 'code.value', undefined);
				code = code ? _.toNumber(code) : undefined;
				let createdAt = _.get(filterObj, 'createdAt.value', undefined);
				createdAt = createdAt ? _.toNumber(createdAt) : undefined;

				setEventFilter('code', code);
				nextFilter.code.value = code;
				setEventFilter('createdAt', createdAt);
				nextFilter.createdAt.value = createdAt;

				return {
					filter: nextFilter
				};
			},
		}
	),
	meteorData((p) => {
		const subscription2 = SubManager.subscribe('hydrants');
		const filterH = getHydrantFindFilter({ addDate: true, addStatus: true, addId: true });
		const dataH = HydrantsCollection.find(filterH).fetch();

		const hids = _.map(dataH, '_id');
		const subscription1 = SubManager.subscribe('events');

		const filterE = getEventFindFilter({
			dateKey: p.filter.createdAt.value,
			codeKey: p.filter.code.value,
		});
		filterE.hydrantId = { $in: hids };
		let dataE = EventsCollection.find(
			filterE,
			{ sort: { [p.sort.name]: p.sort.order } })
			.fetch();

		dataE = _.cloneDeep(dataE.map(({ hydrantId, createdAt, code, ...row }) => ({
			hydrantNumber: _.get(_.find(dataH, ['_id', hydrantId]), 'number', ''),
			createdAt: _.replace((new Date(createdAt)).toLocaleString('he-IL'), ',', ''),
			code: p.filter.code.type[code],
			...row,
		})));
		if (p.sort.name === 'hydrantNumber') {
			dataE.sort((a, b) => (p.sort.order) * (a.hydrantNumber - b.hydrantNumber));
		}
		return {
			dataE,
			dataH,
			huntUnits: _.filter(dataE, ['code', 2]).length,
			loading: !subscription1.ready() || !subscription2.ready(),
			nodata: !dataE.length || !dataH.length,
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	withProps(p => ({
		options: {
			onSortChange: p.setSort,
			defaultSortName: p.sort.name,
			defaultSortOrder: (p.sort.order === 1) ? 'asc' : 'desc',
			onFilterChange: p.setFilter,
		},
	})),
	withLog((p) => { console.log(p); return ''; }),
	setDisplayName('Events')
)(
	(p) => {
		console.log('rendering');
		const formatter = cell => (<span>{cell}</span>);
		const currentDate = (new Date()).toLocaleString('he-IL').split(',')[0];
		return (
			<div className="Events">
				<div style={{ height: 20 }} />
				<BootstrapTable
					keyField="_id"
					containerClass="table_container_class"
					tableContainerClass="table_class"
					data={p.dataE}
					remote
					options={p.options}
					height="600px"
					striped
					hover
				>
					<TableHeaderColumn dataFormat={formatter} width="75px" dataField="hydrantNumber" dataAlign="center" headerAlign="center" dataSort>
						מספר הידרנט
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width="75px" dataField="number" dataAlign="center" headerAlign="center" dataSort>
						מספר אירוע
					</TableHeaderColumn>
					<TableHeaderColumn dataFormat={formatter} width="75px" dataField="edata" dataAlign="center" headerAlign="center" dataSort>
						מידע
					</TableHeaderColumn>
					<TableHeaderColumn
						filterFormatted
						dataFormat={formatter}
						filter={{
							type: 'SelectFilter',
							options: p.filter.code.type,
							selectText: 'בחר',
							defaultValue: p.filter.code.value,
						}}
						width="135px"
						dataField="code"
						dataAlign="center"
						headerAlign="center"
						dataSort
					>
						קוד אירוע
					</TableHeaderColumn>
					<TableHeaderColumn
						dataField="createdAt"
						width="135px"
						dataAlign="left"
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
						תאריך
					</TableHeaderColumn>
				</BootstrapTable>
				<Segment raised textAlign="center" size="big">
					סה&quot;כ ארועי התעללות בהידרנטים ברחבי תאגיד עין אפק:  {p.huntUnits} <br />
					נכון לתאריך: {currentDate}
				</Segment>
			</div>
		);
	});




// (props => (
// 	<div className="Events">
// 		<div style={{ height: 20 }} />
// 		<BootstrapTable data={props.dataE} maxHeight="650px" striped hover>
// 			<TableHeaderColumn isKey dataSort dataField="hydrantNumber" dataAlign="center" headerAlign="center">מספר הידרנט</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="number" dataAlign="center" headerAlign="center">מספר אירוע</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="createdAt" dataAlign="center" headerAlign="center">תאריך</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="code" dataAlign="center" headerAlign="center">קוד אירוע</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="edata" dataAlign="center" headerAlign="center">מידע</TableHeaderColumn>
// 		</BootstrapTable>
// 	</div>
// ));


//
// mapProps(({ dataE, dataH }) => {
// 	dataE = new Proxy(dataE, {
// 		get(obj, prop) {
// 			if (isNaN(prop)) return obj[prop];
// 			const row = _.cloneDeep(obj[prop]);
// 			const hRow = dataH.find(r => r._id === obj[prop].hydrantId);
// 			row.hydrantNumber = hRow ? hRow.number : ' ';
// 			row.createdAt = _.replace((new Date(row.createdAt)).toLocaleString('he-IL'), ',', '');
// 			row.code = eventCodes[row.code];
// 			return row;
// 		},
// 	});
// 	return { dataE };
// }),
