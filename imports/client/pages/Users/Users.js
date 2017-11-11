
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
} from 'recompose';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
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
			data: getStore('data') || [],
			initialized: false,
			loading: false,
			selectedCompanyId: undefined,
			editRole: undefined,
		}), {
			setCData: () => cData => ({ cData }),
			setEditRole: () => editRole => ({ editRole }),
			setSelectedCompanyId: () => selectedCompanyId => ({ selectedCompanyId }),
			setData: () => data => setStore({ data }),
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
				p.setCData(await Meteor.callPromise('companies.get.all')),
				p.setData(_.map(await Meteor.callPromise('users.get.all'),
					({ ...row }) => ({
						edit: 0,
						...row
					})));
				p.setLoading(false);
			}
			console.log('initialized');
			p.setInitialized(true);
		},
	}),
	withHandlers({
		select: ({ data, setData }) => (orow, ncol, nrow) => {
			if (!ncol) return;
			const row = Object.assign({}, data[nrow]);
			for (let i = 1; i <= 3; i += 1) if (i !== ncol - 1) row[`role${i}`] = false;
			row[`role${ncol - 1}`] = true;
			data[nrow] = row;
			setData(data.slice());
		},
		onClick: p => (nrow) => {
			p.setData(_.clone(_.update(p.data, `[${nrow}].edit`, boolean => !boolean)));
			if (p.data[nrow].edit) {
				p.setSelectedCompanyId(p.data[nrow].companyId);
			}
		},
		onSelect: p => (event) => {
			p.setSelectedCompanyId(event.target.value);
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(

	(p) => {
		console.log('rendering');
		console.log('data');
		console.log(p.data);
		console.log('p.selectedCompanyId');
		console.log(p.selectedCompanyId);
		console.log('p.cData');
		console.log(p.cData);
		const formatter = cell => (<span>{cell}</span>);
		const formatButton = (cell, row, ncol, nrow) => (
			<span>
				{!cell ?
					<Button
						bsStyle="primary"
						block
						onClick={() => p.onClick(nrow)}
					>
						ערוך
					</Button>
					:
					<Button
						bsStyle="success"
						onClick={() => p.onClick(nrow)}
						block
					>
						שמור
					</Button>
				}
			</span>
		);
		const formatList = (cell, row, ncol) => (
			<span>
				{!row.edit ?
					cell
					:
					<select value={p.selectedCompanyId} onChange={p.onSelect}>
						{p.cData.map(el => (<option key={el._id} value={el._id}>{el.name}</option>))}
					</select>
				}
			</span>
		);
		const formatRole = () => (<span />);

		const columnClassNameFormat = nrole => (cell, row, ncol, nrow) => {
			return nrole == row.role ? 'selected-cell' : 'not-selected-cell';
		};

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
							options={{
								onRowClick: p.select,
							}}
							height="600px"
						>
							<TableHeaderColumn dataField="name" dataFormat={formatter} width="165px" dataAlign="center" headerAlign="center">
								שם
							</TableHeaderColumn>
							<TableHeaderColumn dataField="email" dataFormat={formatter} width="165px" dataAlign="center" headerAlign="center">
								אימייל
							</TableHeaderColumn>
							<TableHeaderColumn dataField="companyName" dataFormat={formatList} width="165px" dataAlign="center" headerAlign="center">
								חברה
							</TableHeaderColumn>
							{_.map(p.types.roles, (role, n) => (
								<TableHeaderColumn key={n} dataField="role" dataFormat={formatRole} width="85px" columnClassName={columnClassNameFormat(n)} dataAlign="center" headerAlign="center">
									{role}
								</TableHeaderColumn>
							))}
							<TableHeaderColumn dataField="edit" dataFormat={formatButton} dataAlign="center" headerAlign="center"/>
						</BootstrapTable>
					</Box>
				</Flex>
			</div>
		);
	});


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
