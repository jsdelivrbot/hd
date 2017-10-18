/* eslint-disable no-param-reassign */

import { Flex, Box } from 'reflexbox';
import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactSimpleRange from 'react-simple-range';
import {
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
import { Mongo } from 'meteor/mongo';

import Loading from '../../components/Loading/Loading';
import {
	getStore as getStoreEventsPage,
	setStore,
} from '../../Storage/Storage';

import '../../stylesheets/table.scss';
import './Css/Events.scss';

const fetchMeteor = ({ method, params, responseFunc }) => {
	this.setState({ loading: true });
	Meteor.call(method, params, (error, response) => {
		if (error) {
			this.setState({ loading: false });
			console.log(error.reason);
		} else {
			this.setState({ loading: false });
			responseFunc(response);
		}
	});
};

const getStore = (properties) => {
	getStoreEventsPage('eventsPage', properties);
};

export default compose(
	withStateHandlers(
		() => ({
			sort: {},
			filter: {
				code: undefined,
				createdAt: undefined,
			},
			slider: {},
			types: {},
		}), {
			setTypes: () => types => ({ types }),
			setSlider: ({ slider }) => (obj) => {
				console.log('slider obj');
				console.log(obj);
				const nextSlider = _.cloneDeep(slider);
				_.assign(nextSlider, obj);
				setStore({ slider: nextSlider });
				return { slider: nextSlider };
			},
			setSort: () => (name, order) => {
				const sort = {
					name,
					order: (order === 'asc') ? 1 : -1,
				};
				setStore({ sort });
				return { sort };
			},
			setFilter: ({ filter }) => (filterObj) => {
				const nextFilter = _.cloneDeep(filter);
				const index = _.get(filterObj, 'code.value', undefined);
				if (index) {
					const value = filter.code.value;
					if (_.get(value, [index])) {
						_.unset(value, [index]);
					} else {
						_.set(value, [index], true);
					}
					nextFilter.code.value = value;
				}

				let createdAt = _.get(filterObj, 'createdAt.value', undefined);
				createdAt = createdAt ? _.toNumber(createdAt) : undefined;
				if (filter.createdAt.value !== createdAt) {
					nextFilter.createdAt.value = createdAt;
				}

				setStore({ filter: nextFilter });
				return { filter: nextFilter };
			},
		}
	),
	lifecycle({
		state: {
			filterUpdated: true,
			data: [],
			loading: 0,
			initializing: false,
			loadingLenQuery: false,
			countHuntUnits: 0,
			lenQuery: 0,
		},
		componentDidMount() {
			const eventsPageStore = getStore(['countHuntUnits', 'lenQuery', 'data']);
			if (eventsPageStore) {
				this.setState(eventsPageStore);
			} else {
				this.props.setSort({ name: 'createdAt', order: 1 });
				this.props.setFilter({ code: undefined, createdAt: undefined });
				this.fetchInit();
			}
		},
		componentWillReceiveProps(np) {
			if (!this.state.initializing) {
				const filterUpdated = this.props.filter !== np.filter;
				const sortUpdated = this.props.sort !== np.sort;
				const sliderUpdated = this.props.slider !== np.slider;
				if (filterUpdated && !this.state.loading) this.fetchLenQuery(np);
				if (!this.state.loadingLenQuery) {
					if ((filterUpdated || sortUpdated || sliderUpdated) && !this.state.loading) {
						this.fetchData(np);
					}
					if (sortUpdated || filterUpdated) {
						np.setSlider({
							max: this.state.lenQuery,
							value: this.state.lenQuery });
					}
				}
			}
		},

		fetchInit() {
			this.setState({ initializing: true });
			fetchMeteor({
				method: 'events.get.init',
				params: {},
				responseFunc: ({ types, countHuntUnits }) => {
					this.setState({ initializing: false });
					this.props.setTypes(types);
					this.setState({ countHuntUnits });
				} });
		},
		fetchLenQuery(np) {
			this.setState({ loadingLenQuery: true });
			fetchMeteor({
				method: 'get.events.data',
				params: { filter: np.filter },
				responseFunc: (r) => {
					this.setState({
						lenQuery: r.lenQuery || this.state.lenQuery,
						loadingLenQuery: false,
					});
				}
			});
		},
		fetchData(np) {
			const skip = (q => (q > 0 ? q : 0))(np.slider.max - np.slider.value);
			this.setState({
				data: this.state.data.map(({ rowNumber, ...row }, key) => ({
					rowNumber: skip + key,
					...row })) });
			if (!np.slider.drag) {
				fetchMeteor({
					method: 'get.events.data',
					params: {
						filter: np.filter,
						sort: np.sort,
						skip,
					},
					responseFunc: (r) => {
						this.setState({
							data: _.cloneDeep(r.data.map(({ createdAt, code, ...row }, key) => ({
								createdAt: moment(createdAt).format('DD.MM.YYYY'),
								time: moment(createdAt).format('HH:mm'),
								code: np.types.code[code],
								rowNumber: skip + key,
								...row }))) });
					} });
			}
		},

	}),
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
							onChange={p.onSliderChange}
							onChangeComplete={p.onSliderChangeComplete}
							disableTrack
							value={p.slider.value}
							defaultValue={p.slider.value}
							verticalSliderHeight="450px"
							vertical
							sliderSize={40}
							// thumbSize={34}
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
									getElement: getCustomFilter,
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
