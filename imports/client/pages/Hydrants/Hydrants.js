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
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Segment } from 'semantic-ui-react';
import moment from 'moment';
import { Flex, Box } from 'reflexbox'
// import {Checkbox, CheckboxGroup} from 'react-checkbox-group';
// import {Checkbox} from 'primereact/components/checkbox/Checkbox';
// import 'primereact/resources/primereact.min.css';
// import 'primereact/resources/themes/omega/theme.css';
// import 'font-awesome/css/font-awesome.css';

import { OverlayTrigger, Popover, Button, FormGroup, Checkbox } from 'react-bootstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../../stylesheets/table.scss';

import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import {
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
						0: 'מושבת',
						1: 'פעיל',
					},
					value: getHydrantFilter().status || {},
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
				address: {
					value: getHydrantFilter().address,
				},
				description: {
					value: getHydrantFilter().description,
				},
				number: {
					value: getHydrantFilter().number,
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
	branch(p => p.loading, renderComponent(Loading)),
	mapProps(({ rawData, ...p }) => ({
		data: _.cloneDeep(rawData.map(({ createdAt, status, ...row }, key) => ({
			createdAt: moment(createdAt).format('DD.MM.YYYY'),
			status: p.filter.status.type[status],
			rowNumber: key,
			...row,
		}))),
		activeUnits: _.filter(rawData, ['status', 1]).length,
		disabledUnits: _.filter(rawData, ['status', 0]).length,
		totalUnits: rawData.length,
		...p,
	})),
	withProps(p => ({
		options: {
			onSortChange: p.setSort,
			defaultSortName: p.sort.name,
			defaultSortOrder: (p.sort.order === 1) ? 'asc' : 'desc',
			onFilterChange: p.setFilter,
		},
	})),
)(
	(p) => {
		console.log('rendering');
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
		const currentDate = moment().format('DD.MM.YYYY');

		const popoverClickRootClose = (
			<Popover id="popover-trigger-click-root-close" title="סינון">
				<form>
					<FormGroup>
						{_.map(p.filter.status.type, (type, key) => (
							<Checkbox
								key={key}
								checked={_.get(p.filter.status.value, key, false)}
								onChange={() => p.setFilter({ status: { value: key } })}
							>
								{type}
							</Checkbox>
						))}
					</FormGroup>
				</form>
			</Popover>
		);

		const getCustomFilter = () => (
			<OverlayTrigger trigger="click" rootClose placement="top" overlay={popoverClickRootClose}>
				<Button>סינון</Button>
			</OverlayTrigger>
		);

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
							סה&quot;כ מוצרים מותקנים על הידרנטים ברחבי תאגיד עין אפק: {p.totalUnits} יח&#39;<br />
							מתוכם: {p.activeUnits} יח&#39; פעילים {p.disabledUnits} יח&#39; מושבתים<br />
							נכון לתאריך: {currentDate}
						</Box>
						<Box w={1 / 8} />
					</Flex>
				</Segment>
			</div>
		);
	});



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
