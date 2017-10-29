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
import { Flex, Box } from 'reflexbox';
import moment from 'moment';

import { Button } from 'react-bootstrap';
import '../../stylesheets/table.scss';

import Loading from '../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';
import { difProps } from '../../Utils/Utils';
import Slider from '../../components/Slider/Slider';
import MultiSelect from '../../components/MultiSelect/MultiSelect';
import {
	getStore as getStoreHydrantsPage,
	setStore as setStoreHydrantsPage,
} from '../../Storage/Storage';

const getStore = keys => getStoreHydrantsPage('hydrantPage', keys);
const setStore = obj => setStoreHydrantsPage('hydrantsPage', obj);

export default compose(
	withStateHandlers(
		() => ({
			types: getStore('types') || {},
			data: getStore('data') || [],
			cntEnabledUnits: getStore('cntEnabledUnits') || 0,
			cntDisabledUnits: getStore('cntDisabledUnits') || 0,
			cntTotalUnits: getStore('cntTotalUnits') || 0,
			loading: false,
			initialized: false,
			sort: getStore('sort') || { name: 'createdAt', order: 1 },
			filter: getStore('filter') || { status: {} },
			slider: getStore('slider') || { max: 0, value: 0 },
		}), {
			setLoading: () => loading => setStore({ loading }),
			setTypes: () => types => setStore({ types }),
			setCntEnabledUnits: () => cntEnabledUnits => setStore({ cntEnabledUnits }),
			setCntDisabledUnits: () => cntDisabledUnits => setStore({ cntDisabledUnits }),
			setCntTotalUnits: () => cntTotalUnits => setStore({ cntTotalUnits }),
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
				const index = filterObj.status;
				if (index) {
					const statuses = filter.status;
					if (_.get(statuses, [index])) {
						_.unset(statuses, [index]);
					} else {
						_.set(statuses, [index], true);
					}
					filter = Object.assign({}, filter, { status: statuses });
				}
				return setStore({ filter });
			},
			setFilterSearch: ({ filter }) => (filterObj) => {
				const nextFilter = _.clone(filter);

				const index = _.get(filterObj, 'status.value', undefined);
				const address = _.get(filterObj, 'address.value');
				const description = _.get(filterObj, 'description.value');
				const number = _.get(filterObj, 'number.value');

				let createdAt = _.get(filterObj, 'createdAt.value');
				createdAt = createdAt ? _.toNumber(createdAt) : undefined;

				if (index) {
					const value = filter.status.value;
					if (_.get(value, [index])) {
						_.unset(value, [index]);
					} else {
						_.set(value, [index], true);
					}
					nextFilter.status.value = value;
					setHydrantFilter('status', value);
				}

				setHydrantFilter('createdAt', createdAt);
				nextFilter.createdAt.value = createdAt;
				setHydrantFilter('address', address);
				nextFilter.address.value = address;
				setHydrantFilter('description', description);
				nextFilter.description.value = description;
				setHydrantFilter('number', number);
				nextFilter.number.value = number;

				return {
					filter: nextFilter
				};
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
				const { types, cntAbusedUnits } = await Meteor.callPromise('events.get.init');
				this.props.setLoading(false);
				this.props.setTypes(types);
				this.props.setCntAbusedUnits(cntAbusedUnits);
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
	meteorData((p) => {
		const filter = getHydrantFindFilter({
			addDate: true,
			addStatus: true,
			addAddress: true,
			addDescription: true,
			addNumber: true,
			numberKey: p.filter.number.value,
			descriptionKey: p.filter.description.value,
			addressKey: p.filter.address.value,
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
)(
	(p) => {
		console.log('rendering');
		const currentDate = moment().format('DD.MM.YYYY');
		const formatter = cell => (<span>{cell}</span>);

		return (
			<div className="Hydrants">
				<div style={{ height: 20 }} />
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
					<TableHeaderColumn
						filterFormatted
						filter={{
							type: 'TextFilter',
							delay: 1000,
							placeholder: 'חפש',
							defaultValue: p.filter.number.value,
						}}
						width="125px"
						dataField="number"
						dataAlign="left"
						headerAlign="center"
						dataSort
					>
						מספר מזהה
					</TableHeaderColumn>
					<TableHeaderColumn
						filterFormatted
						dataFormat={formatter}
						filter={{
							type: 'CustomFilter',
							getElement: getCustomFilter,
							options: p.filter.status.type,
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
						width="155"
						dataAlign="center"
						headerAlign="center"
						dataSort
						filterFormatted
						dataFormat={formatter}
						filter={{
							type: 'SelectFilter',
							options: p.filter.createdAt.type,
							placeholder: 'בחר',
							defaultValue: p.filter.createdAt.value,
						}}
					>
						תאריך התקנה
					</TableHeaderColumn>
					<TableHeaderColumn
						filterFormatted
						filter={{
							type: 'TextFilter',
							delay: 1000,
							placeholder: 'חפש',
							defaultValue: p.filter.address.value,
						}}
						width="200"
						dataFormat={formatter}
						dataField="address"
						dataAlign="right"
						headerAlign="center"
						dataSort
					>
						כתובת ההתקנה
					</TableHeaderColumn>
					<TableHeaderColumn
						filterFormatted
						filter={{
							type: 'TextFilter',
							delay: 1000,
							placeholder: 'חפש',
							defaultValue: p.filter.description.value,
						}}
						dataFormat={formatter}
						dataField="description"
						dataAlign="right"
						headerAlign="center"
						dataSort
					>
						תאור מקום
					</TableHeaderColumn>
				</BootstrapTable>
				<Segment style={{ marginTop: '20px', height: 100 }} raised textAlign="center" size="big">
					<Flex align="center">
						<Box w={1 / 8}>
							{_.isEmpty(getSelectedHydrants()) ?
								<Button
									bsStyle="primary"
									block
									onClick={() => p.history.push(
										`${p.match.url}/new`
									)}
								>
									חדש
								</Button>
								:
								<Button
									bsStyle="success"
									disabled={getSelectedHydrants().length > 1}
									onClick={() => p.history.push(
										`${p.match.url}/${_.filter(p.data, ['_id', getSelectedHydrants()[0]])[0]._id}/edit`
									)}
									block
								>
									ערוך
								</Button>
							}
						</Box>
						<Box w={6 / 8}>
							סה&quot;כ מוצרים מותקנים על הידרנטים ברחבי תאגיד עין אפק: {p.cntTotalUnits} יח&#39;<br />
							מתוכם: {p.cntEnabledUnits} יח&#39; פעילים {p.cntDisabledUnits} יח&#39; מושבתים<br />
							נכון לתאריך: {currentDate}
						</Box>
						<Box w={1 / 8} />
					</Flex>
				</Segment>
			</div>
		);
	});


// const formatter = (cell) => {
// 	let style = {};
// 	if (cell === p.filter.status.type[0]) {
// 		style = { color: '#ff0000' };
// 	} else if (cell === p.filter.status.type[1]) {
// 		style = { color: '#0000ff' };
// 	}
// 	return (
// 		<span
// 			style={style}
// 		>
// 			{cell}
// 		</span>
// 	);
// };


{/*<FormGroup>*/}
	{/*<ControlLabel>מאופשר</ControlLabel>*/}
	{/*<input*/}
		{/*type="checkbox"*/}
		{/*className="form-control"*/}
		{/*name="enabled"*/}
		{/*ref={enabled => (this.enabled = enabled)}*/}
		{/*defaultChecked={(doc && doc.enabled) ? 'checked' : ''}*/}
	{/*/>*/}
{/*</FormGroup>*/}


{/*<Checkbox value="New York" label="New York" onChange={this.onCityChange}></Checkbox>*/}
{/*<Checkbox value="San Francisco" label="San Francisco" onChange={this.onCityChange}></Checkbox>*/}
{/*<Checkbox value="Los Angeles" label="Los Angeles" onChange={this.onCityChange}></Checkbox>*/}


{/*<Popup*/}
{/*trigger={<Button>סינון</Button>}*/}
{/*flowing*/}
{/*hoverable*/}
{/*// on="click"*/}
{/*position="top center"*/}
{/*style={{*/}
{/*borderRadius: 0,*/}
{/*opacity: 0.9,*/}
{/*padding: '2em',*/}
{/*}}*/}
{/*>*/}
{/*<Grid centered divided columns={1}>*/}
{/*<Grid.Column textAlign="center">*/}
{/*<CheckboxGroup name="fruits" value={['kiwi', 'pineapple']} onChange={this.fruitsChanged}>*/}
{/*<label><Checkbox value="apple"/> Apple</label>*/}
{/*<label><Checkbox value="orange"/> Orange</label>*/}
{/*<label><Checkbox value="watermelon"/> Watermelon</label>*/}
{/*</CheckboxGroup>*/}
{/*</Grid.Column>*/}
{/*</Grid>*/}
{/*</Popup>*/}


{/*<Header as='h4'></Header>*/}
{/*<p><b>2</b> projects, $10 a month</p>*/}
{/*<Button>Choose</Button>*/}

{/*<input*/}
{/*ref="nokCheckbox"*/}
{/*type="checkbox"*/}
{/*className="filter"*/}
{/*onChange={() => console.log('changed')}*/}
{/*defaultChecked={true}*/}
{/*style={{ marginLeft: 30 + 'px' }}*/}
{/*/>*/}
{/*<label>label</label>*/}
{/*<input type="checkbox" style={{ marginLeft: '5px' }} />*/}
{/*<label>label</label>*/}
{/*<input type="checkbox" style={{ marginLeft: '5px' }} />*/}
{/*<label>label</label>*/}
{/*<input type="checkbox" style={{ marginLeft: '5px' }} />*/}
{/*<label>label</label>*/}
{/*<input type="checkbox" style={{ marginLeft: '5px' }} />*/}
{/*<label>label</label>*/}


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
