
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
import { Button, DropdownButton, MenuItem } from 'react-bootstrap';
import Select from 'react-select';
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
			data: getStore('data') || [],
			initialized: false,
			loading: false,
			editCompany: undefined,
			editRole: undefined,
		}), {
			setEditRole: () => editRole => ({ editRole }),
			setEditCompany: () => editCompany => ({ editCompany }),
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
				const uData = await Meteor.callPromise('users.get.all');
				const data = uData.map(({ role, ...row }) => ({
					edit: 0,
					role1: role === 0,
					role2: role === 1,
					role3: role === 2,
					...row }));
				p.setData(data);
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
				p.setEditCompany(p.data[nrow].company);
			}
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(

	(p) => {
		console.log('rendering');
		console.log('data');
		console.log(p.data);
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
		const formatList = (cell, row, ncol, nrow) => (
			<span>
				{!row.edit ?
					cell
					:
					<Select
						name="select"
						value={cell}
						options={p.companies}
						onChange={p.setEditCompany}
					/>
				}
			</span>
		);

		const columnClassNameFormat = (fieldValue, row, rowIdx, colIdx) => {
			return fieldValue === true ? 'selected-cell' : 'not-selected-cell';
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
							<TableHeaderColumn dataField="name" dataFormat={formatter} width="125px" columnClassName={columnClassNameFormat} dataAlign="center" headerAlign="center">
								שם
							</TableHeaderColumn>
							<TableHeaderColumn dataField="email" dataFormat={formatter} width="165px" columnClassName={columnClassNameFormat} dataAlign="center" headerAlign="center">
								אימייל
							</TableHeaderColumn>
							<TableHeaderColumn dataField="company"  dataFormat={formatList} width="165px" columnClassName={columnClassNameFormat} dataAlign="center" headerAlign="center">
								חברה
							</TableHeaderColumn>
							<TableHeaderColumn dataField="role1" dataFormat={formatter} width="85px" columnClassName={columnClassNameFormat} dataAlign="center" headerAlign="center">
								אדמין
							</TableHeaderColumn>
							<TableHeaderColumn dataField="role2" dataFormat={formatter} width="85px" columnClassName={columnClassNameFormat} dataAlign="center" headerAlign="center">
								מוקד
							</TableHeaderColumn>
							<TableHeaderColumn dataField="role3" dataFormat={formatter} width="85px" columnClassName={columnClassNameFormat} dataAlign="center" headerAlign="center">
								אבטחה
							</TableHeaderColumn>
							<TableHeaderColumn dataField="edit" dataFormat={formatButton} columnClassName={columnClassNameFormat}dataAlign="center" headerAlign="center"/>
						</BootstrapTable>
					</Box>
				</Flex>
			</div>
		);
	});
