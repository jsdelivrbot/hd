
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
import _ from 'lodash';
import moment from 'moment';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Segment } from 'semantic-ui-react';
import { Flex, Box } from 'reflexbox';

import Loader from 'react-loader-advanced';
import Loading from '../LoginLayoutNavigation/Loading/Loading';
import { difProps } from '../../Utils/Utils';
import Slider from '../Slider/Slider';
import MultiSelect from '../MultiSelect/MultiSelect';
import { getStore, setStore } from '../Storage';

import '../../stylesheets/table.scss';
import './Css/Events.scss';

export default compose(
	withHandlers({
		getStore: p => keys => getStore(`events_${p.company._id}_${p._id}`, keys),
		setStore: p => obj => setStore(`events_${p.company._id}_${p._id}`, obj),
	}),
	withStateHandlers(
		p => ({
			data: p.getStore('data') || [],
			cntAllUnits: p.getStore('cntAllUnits') || 0,
			loading: false,
			initialized: false,
			sort: p.getStore('sort') || { name: 'createdAt', order: 1 },
			filter: p.getStore('filter') || { code: {}, hydrantId: p._id },
			slider: p.getStore('slider') || { max: 0, value: 0 },
		}), {
			setLoading: () => loading => ({ loading }),
			setCntAllUnits: ({}, p) => cntAllUnits => p.setStore({ cntAllUnits }),
			setData: ({}, p) => data => p.setStore({ data }),
			setInitialized: () => initialized => ({ initialized }),
			setSlider: ({ slider }, p) => (obj) => {
				if (obj.value !== undefined && obj.max >= 12 && obj.value < 12) obj.value = 12;
				slider = Object.assign({}, slider, obj);
				return p.setStore({ slider });
			},
			setSort: ({ sort }, p) => (name, order) => {
				sort = { name, order: (order === 'asc') ? 1 : -1 };
				return p.setStore({ sort });
			},
			setFilterSelect: ({ filter }, p) => (filterObj) => {
				const createdAt = _.get(filterObj, 'createdAt.value');
				filter = Object.assign({}, filter, { createdAt });
				return p.setStore({ filter });
			},
			setFilterCode: ({ filter }, p) => ({ activeCodes: status }) => p.setStore({ filter: _.assign({}, filter, status) }),
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
			const p = this.props;
			this.storeEmpty = false;
			if (!p.getStore()) {
				this.props.setLoading(true);
				const { cntAllUnits } = await Meteor.callPromise('events.get.counts');
				p.setCntAllUnits(cntAllUnits);
				p.setLoading(false);
				this.storeEmpty = true;
			}
			p.setInitialized(true);
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
				skip
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
		console.log('rendering Events');
		const formatter = cell => (<span className={p.loading ? 'blurryLoadingText' : ''}>{cell}</span>);
		const currentDate = moment().format('DD.MM.YYYY');

		return (
			<div className="events">
				<Flex>
					<Box w={1 / 12} pl={2}>
						<Slider {...p} />
					</Box>
					<Box w={11 / 12}>
						<Loader show={p.loading} message={Loading()} backgroundStyle={{ backgroundColor: 'transparent' }}>
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
								<TableHeaderColumn dataField="rowNumber" dataFormat={formatter} width="75px" dataAlign="right" headerAlign="center">
									מס&quot;ד<br /><br /><br /><br />
								</TableHeaderColumn>
								<TableHeaderColumn dataField="hydrantNumber" dataSort dataFormat={formatter} width="75px" dataAlign="right" headerAlign="center">
									מספר מזהה<br /><br />
								</TableHeaderColumn>
								<TableHeaderColumn
									filterFormatted
									dataFormat={formatter}
									filter={{
										type: 'CustomFilter',
										getElement: () => MultiSelect({ types: p.types.code, activeCodes: p.filter.code, onChange: p.setFilterCode }),
									}}
									width="155px"
									dataField="code"
									dataAlign="center"
									headerAlign="center"
									dataSort
								>
									סוג ההתראה<br />
								</TableHeaderColumn>
								<TableHeaderColumn
									width="85px"
									dataField="edata"
									dataAlign="right"
									headerAlign="center"
								>
									מידע<br />
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
										placeholder: 'בחר',
										selectText: 'בחר',
										defaultValue: p.filter.createdAt,
									}}
								>
									זמן האירוע<br />
								</TableHeaderColumn>
								<TableHeaderColumn dataField="time" width="135px" dataFormat={formatter} dataAlign="center" headerAlign="center" />
								<TableHeaderColumn dataFormat={formatter} dataField="description" dataAlign="right" headerAlign="center">
									כתובת התקנה<br /><br /><br /><br />
								</TableHeaderColumn>
							</BootstrapTable>
						</Loader>
					</Box>
				</Flex>
				<If condition={!p._id}>
					<Segment style={{ marginTop: '20px' }} raised textAlign="center" size="big">
						סה&quot;כ ארועים בהידרנטים :  {p.cntAllUnits} <br />
						נכון לתאריך: {currentDate}
					</Segment>
				</If>
			</div>
		);
	});

// סה&quot;כ ארועים בהידרנטים ברחבי תאגיד {p.company.name}:  {p.cntAllUnits} <br />

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
