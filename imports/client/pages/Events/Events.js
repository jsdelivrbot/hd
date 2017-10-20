/* eslint-disable no-param-reassign */

import { Flex, Box } from 'reflexbox';
import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactSimpleRange from 'react-simple-range';
import {
	renderNothing,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	withProps,
	withPropsOnChange,
	withState,
	lifecycle,
	shallowEqual,
	shouldUpdate,
} from 'recompose';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import { Segment } from 'semantic-ui-react';
import moment from 'moment';
import { OverlayTrigger, Popover, Button, FormGroup, Checkbox } from 'react-bootstrap';

import Loading from '../../components/Loading/Loading';
import {
	getStore as getStoreEventsPage,
	setStore as setStoreEventsPage,
} from '../../Storage/Storage';

import '../../stylesheets/table.scss';
import './Css/Events.scss';

const getStore = (keys) => {
	getStoreEventsPage('eventsPage', keys);
};
const setStore = (obj) => {
	setStoreEventsPage('eventsPage', obj);
	return obj;
};

const difProps = (obj1, obj2) => (
	_.reduce(obj1, (result, value, key) => {
		if (value !== obj2[key]) result[key] = value;
		return result;
	}));

export default compose(
	withStateHandlers(
		() => ({
			sort: getStore(['countHuntUnits']) || { name: 'createdAt', order: 1 },
			filter: getStore(['countHuntUnits']) || { code: undefined, createdAt: undefined },
			slider: {},
			initialized: false,
		}), {
			setInitialized: () => initialized => ({ initialized }),
			setSlider:
				({ slider }) =>
					obj =>
						setStore({ slider: Object.assign({}, slider, obj) }),
			setSort: () => (name, order) => {
				const sort = {
					name,
					order: (order === 'asc') ? 1 : -1,
				};
				return setStore({ sort });
			},
			setFilter:
				({ filter }) =>
					(filterObj) => {
						const index = _.get(filterObj, 'code.value');
						if (index) {
							const value = filter.code;
							if (_.get(value, [index])) {
								_.unset(value, [index]);
							} else {
								_.set(value, [index], true);
							}
							filter = Object.assign({}, filter, { code: value });
						}
						((createdAt) => {
							if (createdAt) filter = Object.assign({}, filter, { createdAt });
						})();

						return setStore({ filter });
					},
		}
	),
	lifecycle({
		state: {
			types: {},
			data: getStore(['data']) || [],
			countHuntUnits: getStore(['countHuntUnits']) || 0,
			lenQuery: getStore(['lenQuery']) || 0,
			loading: false,
			modifiedProps: {},
		},
		setLoading: loading => this.setState({ loading }),
		setModifiedProps: modifiedProps => this.setState({ modifiedProps }),
		setTypes: types => this.setState(setStore({ types })),
		setCountHuntUnits: countHuntUnits => this.setState(setStore({ countHuntUnits })),
		setLenQuery: lenQuery => this.setState(setStore({ lenQuery })),
		setData: data => this.setState(setStore({ data })),

		async componentDidMount() {
			const p = this.props;
			if (!getStore()) {
				const { types, countHuntUnits } = await Meteor.callPromise('events.get.init');
				this.setTypes(types);
				this.setCountHuntUnits(countHuntUnits);
			}
			p.setInitialized(true);
		},
		async componentWillReceiveProps(np) {
			if (!np.initialized) return;

			this.setLoading(true);
			const modifiedProps = difProps(this.props, np);
			this.setModifiedProps(modifiedProps);

			const { filter, sort, slider } = modifiedProps;
			if (filter) {
				this.setLenQuery(await Meteor.callPromise('get.events.data', { filter: np.filter }));
			}
			if (filter || sort || slider) {
				this.setData(await this.fetchData(np));
			}
			this.setLoading(false);
		},

		async fetchData(p) {
			const skip = (q => (q > 0 ? q : 0))(p.slider.max - p.slider.value);
			if (!p.slider.drag) {
				this.setState({
					data: this.state.data.map(({ rowNumber, ...row }, key) => ({
						rowNumber: skip + key,
						...row })) });
			} else {
				const data = await Meteor.callPromise('get.events.data', {
					filter: p.filter,
					sort: p.sort,
					skip,
				});
				this.setData(_.map(data, ({ createdAt, code, ...row }, key) => ({
					createdAt: moment(createdAt).format('DD.MM.YYYY'),
					time: moment(createdAt).format('HH:mm'),
					code: this.state.types.code[code],
					rowNumber: skip + key,
					...row })));
			}
		},

	}),
	withPropsOnChange(['filter', 'sort'], (p) => {
		p.setSlider({ max: p.lenQuery });
		p.setSlider({ value: 0 });
	}),
	// branch(() => true, renderNothing),
	withProps(p => ({
		onSliderChange: obj => p.setSlider(obj),
		onSliderChangeComplete: obj => p.setSlider(obj),
		tableOptions: {
			onSortChange: p.setSort,
			defaultSortName: p.sort.name,
			defaultSortOrder: (p.sort.order === 1) ? 'asc' : 'desc',
			onFilterChange: p.setFilter,
		},
	})),
	shouldUpdate((props, nextProps) => shallowEqual(props, nextProps)),
)(
	(p) => {
		console.log('rendering');
		const formatter = cell => (<span>{cell}</span>);
		const currentDate = moment().format('DD.MM.YYYY');

		const popoverClickRootClose = (
			<Popover id="popover-trigger-click-root-close" title="סינון" style={{ maxWidth: 500 }}>
				<form>
					<FormGroup>
						{_.map(p.types.code,
							(type, key) => {
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

		const tableCustomFilter = () => (
			<OverlayTrigger trigger="click" rootClose placement="top" overlay={popoverClickRootClose}>
				<Button>סינון</Button>
			</OverlayTrigger>
		);

		return (
			<div className="Events">
				<div style={{ height: 20 }} />
				<Flex align="center">
					<Box w={1 / 8}>
						<ReactSimpleRange
							onChange={p.onSliderChange}
							onChangeComplete={p.onSliderChangeComplete}
							disableTrack
							value={p.slider.value}
							defaultValue={p.slider.value}
							verticalSliderHeight="450px"
							vertical
							sliderSize={40}
							max={p.slider.max}
							step={12}
						>
							<div className="slider">
								<Flex align="center" justify="space-around" w={1} py={2}>
									<Box>
										{p.slider.max - p.slider.value}
									</Box>
								</Flex>
							</div>
						</ReactSimpleRange>
					</Box>
					<Box w={7 / 8}>
						<BootstrapTable
							keyField="_id"
							containerClass="table_container_class"
							tableContainerClass="table_class"
							data={p.data}
							remote
							options={p.tableOptions}
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
									getElement: tableCustomFilter,
									options: p.types.code,
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
									options: p.types.createdAt,
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
					סה&quot;כ ארועי התעללות בהידרנטים ברחבי תאגיד עין אפק:  {p.countHuntUnits} <br />
					נכון לתאריך: {currentDate}
				</Segment>
			</div>
		);
	});

	
	
	
//
// function ifDefThen(q, f) {
// 	const c = q();
// 	if (c) f(c);
// }
// ifDefThen(
// 	_.toNumber(_.get(filterObj, 'createdAt.value')),
// 	createdAt => filter = Object.assign({}, filter, { createdAt })
// ).bind(this);
	

// const fetchMeteor = ({ method, params, responseFunc }) => {
// 	this.setState({ loading: true });
// 	Meteor.call(method, params, (error, response) => {
// 		if (error) {
// 			this.setState({ loading: false });
// 			console.log(error.reason);
// 		} else {
// 			this.setState({ loading: false });
// 			responseFunc(response);
// 		}
// 	});
// };


// this.setState({
// 	data:
// 		_.range(13).map((number, key) => {
// 			return {
// 				rowNumber: skip + key,
// 			};
// 		})
// });

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
