
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
	withHandlers,
	compose,
	withStateHandlers,
	lifecycle,
	renderComponent,
	branch,
	shallowEqual,
} from 'recompose';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import fp from 'lodash/fp';
import { Flex, Box } from 'reflexbox';
import { Button } from 'react-bootstrap';
import 'react-select/dist/react-select.css';

import '../../stylesheets/table.scss';
import './Css/Users.scss';

import Loading from '../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';

import {
	getStore as getStoreUsersPage,
	setStore as setStoreUsersPage,
} from '../../Storage/Storage';

const getStore = keys => getStoreUsersPage('usersPage', keys);
const setStore = obj => setStoreUsersPage('usersPage', obj);

export default compose(
	withStateHandlers(
		() => ({
			cData: [],
			editRow: {},
			data: getStore('data') || [],
			initialized: false,
			loading: false,
		}), {
			assignEditRow: ({ editRow }) => obj => ({ editRow: _.assign({}, editRow, _.cloneDeep(obj)) }),
			setEditRow: () => editRow => ({ editRow: _.cloneDeep(editRow) }),
			setCData: () => cData => ({ cData: _.clone(cData) }),
			setData: () => data => setStore({ data: _.clone(data) }),
			setDataRow: ({ data }) => (row, nRow) => setStore({ data: _.clone(_.set(data, `[${nRow}]`, _.cloneDeep(row))) }),
			setLoading: () => loading => ({ loading }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	lifecycle({
		async componentDidMount() {
			console.log('initializing');
			const p = this.props;
			if (!getStore()) {
				this.props.setLoading(true);
				p.setCData(await Meteor.callPromise('companies.get.all'));
				p.setData(_.map(await Meteor.callPromise('users.get.all'), (e, k) => _.assign(e, { nRow: k })));
				p.setLoading(false);
			}
			console.log('initialized');
			p.setInitialized(true);
		},
	}),
	withHandlers({
		onClickEdit: p => (row) => {
			p.setEditRow(row);
		},
		onClickSave: p => (row) => {
			console.log('onClickSave');
			if (!_.isEqual(row, p.editRow)) p.setDataRow(p.editRow, row.nRow);
			p.setEditRow({});
		},
		onClickRole: p => (role) => {
			console.log('onClickRole');
			if (role !== p.editRow.role) p.assignEditRow({ role });
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(

	(p) => {
		console.log('rendering');
		console.log('data');
		console.log(p.data);
		console.log('p.cData');
		console.log(p.cData);

		const formatter = cell => (<span>{cell}</span>);
		const formatButton = (cell, row, ncol, nRow) => (
			<span>
				{nRow == p.editRow.nRow ?
					<Button
						bsStyle="primary"
						block
						onClick={() => p.onClickSave(row)}
					>
						שמור
					</Button>
					:
					<Button
						bsStyle="success"
						onClick={() => p.editRow.nRow || p.onClickEdit(row)}
						block
					>
						ערוך
					</Button>
				}
			</span>
		);
		const formatList = (cell, row, ncol, nRow) => (
			<span>
				{nRow == p.editRow.nRow ?
					<select value={p.editRow.companyId} onChange={e => p.assignEditRow({ companyId: e.target.value })}>
						{p.cData.map(el => (<option key={el._id} value={el._id}>{el.name}</option>))}
					</select>
					:
					_.find(p.cData, ['_id', cell]).name
				}
			</span>
		);
		const formatRole = role => (cell, row, ncol, nRow) => (
			<span>
				{nRow == p.editRow.nRow ?
					<Button
						bsStyle="primary" block
						className={(role == p.editRow.role) ? 'selected-cell' : 'not-selected-cell'}
						onClick={() => p.onClickRole(role)}
					>
						&nbsp;
					</Button>
					:
					<Button
						bsStyle="primary" block
						className={(role == row.role) ? 'selected-cell' : 'not-selected-cell'}
					>
						&nbsp;
					</Button>
				}
			</span>
		);

		return (
			<div className="users">
				<Flex>
					<Box w={11 / 12}>
						<BootstrapTable
							keyField="_id"
							containerClass="table_container_class"
							tableContainerClass="table_class"
							data={p.data}
							remote
							height="600px"
						>
							<TableHeaderColumn dataField="name" dataFormat={formatter} width="165px" dataAlign="center" headerAlign="center">
								שם
							</TableHeaderColumn>
							<TableHeaderColumn dataField="email" dataFormat={formatter} width="165px" dataAlign="center" headerAlign="center">
								אימייל
							</TableHeaderColumn>
							<TableHeaderColumn dataField="companyId" dataFormat={formatList} width="165px" dataAlign="center" headerAlign="center">
								חברה
							</TableHeaderColumn>
							{_.map(p.types.roles, (role, n) => (
								<TableHeaderColumn key={n} dataField="role" dataFormat={formatRole(n)} width="85px" dataAlign="center" headerAlign="center">
									{role}
								</TableHeaderColumn>
							))}
							<TableHeaderColumn dataFormat={formatButton} dataAlign="center" headerAlign="center" />
						</BootstrapTable>
					</Box>
				</Flex>
			</div>
		);
	});


// options={{
// 	onRowClick: p.select,
// }}
// select: ({ data, setData }) => (orow, ncol, nRow, a) => {
// 	console.log('select');
// 	if (!ncol) return;
// 	const row = Object.assign({}, data[nRow]);
// 	for (let i = 1; i <= 3; i += 1) if (i !== ncol - 1) row[`role${i}`] = false;
// 	row[`role${ncol - 1}`] = true;
// 	data[nRow] = row;
// 	setData(data.slice());
// },


// {/*<select>*/}
// 	{/*<option value="volvo">Volvo</option>*/}
// 	{/*<option value="saab">Saab</option>*/}
// 	{/*<option value="mercedes">Mercedes</option>*/}
// 	{/*<option value="audi">Audi</option>*/}
// {/*</select>*/}


// <FormGroup controlId="formControlsSelect">
// 	<FormControl componentClass="select" placeholder="select1">
// 		<option value="select1">select1</option>
// 		<option value="select2">select2</option>
// 		<option value="select3">select3</option>
// 	</FormControl>
// </FormGroup>
// <Select
//
// 	name="select"
// 	value={cell}
// 	options={p.cData}
// 	onChange={p.setSelectedCompanyId}
// />
