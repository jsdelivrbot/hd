
import { Flex, Box } from 'reflexbox';
import { Meteor } from 'meteor/meteor';
import React from 'react';
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
import { Segment } from 'semantic-ui-react';
import moment from 'moment';

import Loading from '../../components/Loading/Loading';
import { difProps } from '../../Utils/Utils';
import Slider from '../../components/Slider/Slider';
import MultiSelect from '../../components/MultiSelect/MultiSelect';
import {
	getStore as getStoreEventsPage,
	setStore as setStoreEventsPage,
} from '../../Storage/Storage';

import '../../stylesheets/table.scss';
import './Css/Events.scss';

const getStore = keys => getStoreEventsPage('eventsPage', keys);
const setStore = obj => setStoreEventsPage('eventsPage', obj);

export default compose(
	withStateHandlers(
		() => ({
			types: getStore('types') || {},
			data: getStore('data') || [],
			countHuntUnits: getStore('countHuntUnits') || 0,
			loading: false,
			initialized: false,
			sort: getStore('sort') || { name: 'createdAt', order: 1 },
			filter: getStore('filter') || { code: {}, createdAt: undefined },
			slider: getStore('slider') || { max: 0, value: 0 },
		}), {
			setLoading: () => loading => setStore({ loading }),
			setTypes: () => types => setStore({ types }),
			setCountHuntUnits: () => countHuntUnits => setStore({ countHuntUnits }),
			setData: () => data => setStore({ data }),
			setInitialized: () => initialized => ({ initialized }),
			setSlider: ({ slider }) => (obj) => {
				if (obj.value !== undefined && obj.value < 12) obj.value = 12;
				slider = Object.assign({}, slider, obj);
				return setStore({ slider });
			},
			setSort: ({ sort }) => (name, order) => {
				sort = { name, order: (order === 'asc') ? 1 : -1 };
				return setStore({ sort });
			},
			setFilterSelect: ({ filter }) => (filterObj) => {
				const createdAt = _.get(filterObj, 'createdAt.value');
				filter = Object.assign({}, filter, { createdAt });
				return setStore({ filter });
			},
			setFilterMultiSelect: ({ filter }) => (filterObj) => {
				const index = filterObj.code;
				if (index) {
					const codes = filter.code;
					if (_.get(codes, [index])) {
						_.unset(codes, [index]);
					} else {
						_.set(codes, [index], true);
					}
					filter = Object.assign({}, filter, { code: codes });
				}
				return setStore({ filter });
			},
		}
	),
	withHandlers({
		sliderInc: ({ slider, setSlider }) => () => {
			if (slider.value < slider.max) setSlider({ value: slider.value + 1 });
		},
		sliderDec: ({ slider, setSlider }) => () => {
			if (slider.value > 0) setSlider({ value: slider.value - 1 });
		},
	}),
	lifecycle({
		async componentDidMount() {
			console.log('initializing');
			this.storeEmpty = false;
			if (!getStore()) {
				this.props.setLoading(true);
				const { types, countHuntUnits } = await Meteor.callPromise('events.get.init');
				this.props.setLoading(false);
				this.props.setTypes(types);
				this.props.setCountHuntUnits(countHuntUnits);
				this.storeEmpty = true;
			}
			this.props.setInitialized(true);
		},
		async componentWillReceiveProps(p) {
			if (!p.initialized) return;
			if (p.loading) return;
			const { filter, sort, slider } = difProps({ prevProps: this.props, nextProps: p });
			if (filter || this.storeEmpty) {
				this.storeEmpty = false;
				p.setLoading(true);
				const lenQuery = await Meteor.callPromise('events.get.lenQuery', { filter: p.filter });
				p.setLoading(false);
				p.setSlider({ max: lenQuery, value: lenQuery });
			}
			if (sort) {
				p.setSlider({ value: p.slider.max });
			}
			if (slider) {
				const skip = (q => (q > 0 ? q : 0))(p.slider.max - p.slider.value);
				let data;
				if (p.slider.drag) {
					data = p.data.map(({ rowNumber, ...row }, key) => ({
						rowNumber: skip + key,
						...row }));
					p.setData(data);
				} else {
					p.setData(await this.fetchData(p, skip));
				}
			}
		},

		async fetchData(p, skip) {
			let data;
			p.setLoading(true);
			data = await Meteor.callPromise('events.get.data', {
				filter: p.filter,
				sort: p.sort,
				skip,
			});

			p.setLoading(false);
			data = _.map(data, ({ createdAt, code, ...row }, key) => ({
				createdAt: moment(createdAt).format('DD.MM.YYYY'),
				time: moment(createdAt).format('HH:mm'),
				code: p.types.code[code],
				rowNumber: skip + key,
				...row }));
			return data;
		},

	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering');
		const formatter = cell => (<span>{cell}</span>);
		const currentDate = moment().format('DD.MM.YYYY');

		return (
			<div className="events">
				<Flex>
					<Box w={1 / 12} pl={2}>
						<Slider {...p} />
					</Box>
					<Box w={11 / 12}>
						<BootstrapTable
							keyField="_id"
							containerClass="table_container_class"
							tableContainerClass="table_class"
							data={p.data}
							remote
							options={{
								onSortChange: p.setSort,
								defaultSortName: p.sort.name,
								defaultSortOrder: (p.sort.order === 1) ? 'asc' : 'desc',
								onFilterChange: p.setFilterSelect,
							}}
							height="600px"
							striped
							hover
						>
							<TableHeaderColumn dataFormat={formatter} width="75px" dataField="rowNumber" dataAlign="left" headerAlign="center">
								מס&quot;ד
							</TableHeaderColumn>
							<TableHeaderColumn dataFormat={formatter} width="75px" dataField="hydrantNumber" dataAlign="center" headerAlign="center">
								מספר מזהה
							</TableHeaderColumn>
							<TableHeaderColumn
								filterFormatted
								dataFormat={formatter}
								filter={{
									type: 'CustomFilter',
									getElement: () => MultiSelect(p)
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
									defaultValue: p.filter.createdAt,
								}}
							>
								זמן האירוע
							</TableHeaderColumn>
							<TableHeaderColumn dataField="time" width="135px" dataAlign="center" headerAlign="center" />
							<TableHeaderColumn dataFormat={formatter} dataField="description" dataAlign="right" headerAlign="center">
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

	
	

// shouldUpdate((props, nextProps) => !shallowEqual(props, nextProps)),

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
