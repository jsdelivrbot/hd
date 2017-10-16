/* eslint-disable no-param-reassign */

import { Flex, Box } from 'reflexbox'
import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactSimpleRange from 'react-simple-range';
import {
	mapProps,
	setDisplayName,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	withProps,
} from 'recompose';
import withCallbackOnChange from '@hocs/with-callback-on-change';
import withLog from '@hocs/with-log';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import { Segment } from 'semantic-ui-react';
import moment from 'moment';
// import moment from 'meteor/momentjs:moment';
import { OverlayTrigger, Popover, Button, FormGroup, Checkbox } from 'react-bootstrap';
import { Mongo } from 'meteor/mongo';

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
	getEventsBackendFilterParams,
	setEventSlider,
	getEventSlider,
} from '../../Storage/Storage';

import '../../stylesheets/table.scss';

const EventsH = new Mongo.Collection('EventsH');
const EventsHCount = new Mongo.Collection('EventsHCount');

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
					value: getEventFilter().code || {},
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
			slider: getEventSlider() || {},
		}), {
			setSlider: ({ slider }) => (obj) => {
				console.log('setting slider');
				console.log(slider);
				_.assign(slider, obj);
				console.log('assigned slider');
				console.log(slider);
				setEventSlider(slider);
				return { slider };
			},
			setSort: () => (name, order) => {
				const sort = {
					name,
					order: (order === 'asc') ? 1 : -1,
				};
				setEventSort(sort);
				return { sort };
			},
			setFilter: ({ filter, methodStatus }) => (filterObj) => {
				const nextFilter = _.clone(filter);
				console.log('setting filter');
				console.log('new filter');
				console.log(filterObj);
				console.log('prev filter');
				console.log(filter);
				const index = _.get(filterObj, 'code.value', undefined);
				if (index) {
					const value = filter.code.value;
					if (_.get(value, [index])) {
						_.unset(value, [index]);
					} else {
						_.set(value, [index], true);
					}
					nextFilter.code.value = value;
					setEventFilter('code', value);
				}

				let createdAt = _.get(filterObj, 'createdAt.value', undefined);
				createdAt = createdAt ? _.toNumber(createdAt) : undefined;
				if (filter.createdAt.value !== createdAt) {
					setEventFilter('createdAt', createdAt);
					nextFilter.createdAt.value = createdAt;
					methodStatus = 0;
				}

				return {
					filter: nextFilter,
				};
			},
		}
	),
	withCallbackOnChange('filter', (p) => {
		const { filterH, filterE } = getEventsBackendFilterParams({
			keyDateE: p.filter.createdAt.value,
			keyCode: p.filter.code.value,
		});
		Meteor.call('getEventsHCount', {
			filterH,
			filterE,
		}, (error, response) => {
			if (error) {
				console.log(error.reason);
			} else if (!response[0]) {
				console.log('method getEventsHCount return undefined');
			} else {
				p.setSlider({ max: response[0].count });
			}
		});
	}),
	meteorData((p) => {
		const { filterH, filterE } = getEventsBackendFilterParams({
			keyDateE: p.filter.createdAt.value,
			keyCode: p.filter.code.value,
		});

		let data;
		let huntUnits;
		const loading = false;

		let skip = 0;

		if (p.slider) {
			skip = p.slider.max - p.slider.value;
			if (skip < 0) skip = 0;
		} else {
			skip = 0;
		}
		console.log(skip);
		console.log('subscribing');

		const subscription1 = Meteor.subscribe('eventsH', {
			filterH,
			filterE,
			limit: 12,
			skip,
			sort: { [p.sort.name]: p.sort.order },
		});

		if (subscription1.ready()) {
			data = EventsH.find(
				filterE,
				{ sort: { [p.sort.name]: p.sort.order } })
				.fetch();
			huntUnits = _.filter(data, ['code', 2]).length;
			data = _.cloneDeep(data.map(({ createdAt, code, ...row }, key) => {
				return {
					createdAt: moment(createdAt).format('DD.MM.YYYY'),
					time: moment(createdAt).format('HH:mm'),
					code: p.filter.code.type[code],
					rowNumber: skip + key,
					...row,
				};
			}));
		}

		return {
			data,
			huntUnits,
			loading,
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
	withLog((p) => { console.log('data'); return p.data; }),
	setDisplayName('Events')
)(
	(p) => {
		console.log('rendering');
		const formatter = cell => (<span>{cell}</span>);
		const currentDate = moment().format('DD.MM.YYYY');

		const popoverClickRootClose = (
			<Popover id="popover-trigger-click-root-close" title="סינון" style={{ maxWidth: 500 }}>
				<form>
					<FormGroup>
						{_.map(p.filter.code.type,
							(type, key) => {
								const len = _.size(p.filter.code.type);
								return (
									<Checkbox
										style={{ marginLeft: 10 }}
										inline
										key={key}
										checked={_.get(p.filter.code.value, key, false)}
										onChange={() => p.setFilter({ code: { value: key } })}

									>
										{type}
									</Checkbox>
								);
							}
						)}
					</FormGroup>
				</form>
			</Popover>
		);

		const getCustomFilter = () => {
			return (
				<OverlayTrigger trigger="click" rootClose placement="top" overlay={popoverClickRootClose}>
					<Button>סינון</Button>
				</OverlayTrigger>
			);
		};


		return (
			<div className="Events">
				<div style={{ height: 20 }} />
				<Flex align="center">
					<Box w={1 / 8}>
						<ReactSimpleRange
							// value={p.slider && p.slider.value}
							onChange={p.setSlider}
							label
							defaultValue={p.slider && p.slider.value}
							//defaultValue={10}
							// disableTrack
							verticalSliderHeight="450px"
							vertical
							sliderSize={19}
							thumbSize={34}
							max={p.slider && p.slider.max}
							//max={100}
							step={1}
						>
							<div style={{ marginLeft: '0px' }}>oo</div>
						</ReactSimpleRange>
					</Box>
					<Box w={7 / 8}>
						<BootstrapTable
							keyField="_id"
							containerClass="table_container_class"
							tableContainerClass="table_class"
							data={p.data}
							remote
							options={p.options}
							height="600px"
							striped
							hover
						>
							<TableHeaderColumn dataFormat={formatter} width="55px" dataField="rowNumber" dataAlign="left" headerAlign="center" dataSort>
								מס&quot;ד
							</TableHeaderColumn>
							<TableHeaderColumn dataFormat={formatter} width="75px" dataField="hydrantNumber" dataAlign="center" headerAlign="center" dataSort>
								מספר מזהה
							</TableHeaderColumn>
							<TableHeaderColumn
								filterFormatted
								dataFormat={formatter}
								filter={{
									type: 'CustomFilter',
									getElement: getCustomFilter,
									options: p.filter.code.type,
									selectText: 'בחר',
									defaultValue: p.filter.code.value,
								}}
								width="155px"
								dataField="code"
								dataAlign="center"
								headerAlign="center"
								dataSort
							>
								סוג ההתראה
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField="createdAt"
								width="135px"
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
								זמן האירוע
							</TableHeaderColumn>
							<TableHeaderColumn dataField="time" width="135px" dataAlign="center" headerAlign="center" />
							<TableHeaderColumn dataFormat={formatter} dataField="description" dataAlign="right" headerAlign="center" dataSort>
								תאור מקום
							</TableHeaderColumn>
						</BootstrapTable>
					</Box>
				</Flex>
				<Segment style={{ marginTop: '20px' }} raised textAlign="center" size="big">
					סה&quot;כ ארועי התעללות בהידרנטים ברחבי תאגיד עין אפק:  {p.huntUnits} <br />
					נכון לתאריך: {currentDate}
				</Segment>
			</div>
		);
	});


// data = _.range(13).map((number, key) => {
// return {
// rowNumber: skip + key,
// };
// });



{/*<Col md={6}>*/}
	{/*{_.map(p.filter.code.type,*/}
		{/*(type, key) => {*/}
			{/*const len = _.size(p.filter.code.type);*/}
			{/*if (key % 2) return '';*/}
			{/*return (*/}
				{/*<Checkbox*/}
					{/*key={key}*/}
					{/*checked={_.get(p.filter.code.value, key, false)}*/}
					{/*onChange={() => p.setFilter({ code: { value: key } })}*/}
				{/*>*/}
					{/*{type}*/}
				{/*</Checkbox>*/}
			{/*);*/}
		{/*}*/}
	{/*)}*/}
{/*</Col>*/}
{/*<Col md={6}>*/}
	{/*{_.map(p.filter.code.type,*/}
		{/*(type, key) => {*/}
			{/*const len = _.size(p.filter.code.type);*/}
			{/*if (!(key % 2)) return '';*/}
			{/*return (*/}
				{/*<Checkbox*/}
					{/*key={key}*/}
					{/*checked={_.get(p.filter.code.value, key, false)}*/}
					{/*onChange={() => p.setFilter({ code: { value: key } })}*/}
				{/*>*/}
					{/*{type}*/}
				{/*</Checkbox>*/}
			{/*);*/}
		{/*}*/}
	{/*)}*/}
{/*</Col>*/}



// (props => (
// 	<div className="Events">
// 		<div style={{ height: 20 }} />
// 		<BootstrapTable data={props.data} maxHeight="650px" striped hover>
// 			<TableHeaderColumn isKey dataSort dataField="hydrantNumber" dataAlign="center" headerAlign="center">מספר הידרנט</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="number" dataAlign="center" headerAlign="center">מספר אירוע</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="createdAt" dataAlign="center" headerAlign="center">תאריך</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="code" dataAlign="center" headerAlign="center">קוד אירוע</TableHeaderColumn>
// 			<TableHeaderColumn dataSort dataField="edata" dataAlign="center" headerAlign="center">מידע</TableHeaderColumn>
// 		</BootstrapTable>
// 	</div>
// ));


//
// mapProps(({ data, dataH }) => {
// 	data = new Proxy(data, {
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
// 	return { data };
// }),
