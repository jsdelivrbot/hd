
import React from 'react';
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
		}), {
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
				const data = await Meteor.callPromise('companies.get.all');
				reactiveVar.set({ company: data[0] });
				p.setData(data);
				p.setLoading(false);
			}
			console.log('initialized');
			this.props.setInitialized(true);
		},
	}),
	lifecycle({
		componentDidMount() {
			console.log('initializing');
			this.props.setData([
				{ name: 'משה1 בן משה', email: 'moshe1@gmail.com', role1: true, role2: false, role3: false, role4: false, role5: false, role6: false, role7: false },
				{ name: 'משה2 בן משה', email: 'moshe2@gmail.com', role1: false, role2: true, role3: false, role4: false, role5: false, role6: false, role7: false },
				{ name: 'משה3 בן משה', email: 'moshe3@gmail.com', role1: false, role2: false, role3: true, role4: false, role5: false, role6: false, role7: false },
				{ name: 'משה4 בן משה', email: 'moshe4@gmail.com', role1: false, role2: false, role3: false, role4: true, role5: false, role6: false, role7: false },
				{ name: 'משה5 בן משה', email: 'moshe5@gmail.com', role1: false, role2: false, role3: false, role4: false, role5: true, role6: false, role7: false },
				{ name: 'משה6 בן משה', email: 'moshe6@gmail.com', role1: false, role2: false, role3: false, role4: false, role5: false, role6: true, role7: false },
				{ name: 'משה7 בן משה', email: 'moshe7@gmail.com', role1: false, role2: false, role3: false, role4: false, role5: false, role6: false, role7: true },
				{ name: 'משה8 בן משה', email: 'moshe8@gmail.com', role1: true, role2: false, role3: false, role4: false, role5: false, role6: false, role7: false },
				{ name: 'משה9 בן משה', email: 'moshe9@gmail.com', role1: false, role2: true, role3: false, role4: false, role5: false, role6: false, role7: false },
			]);
			this.props.setInitialized(true);
		},
	}),
	withHandlers({
		select: ({ data, setData }) => (orow, ncol, nrow) => {
			const row = Object.assign({}, data[nrow]);
			for (let i = 1; i <= 7; i += 1) if (i !== ncol - 1) row[`role${i}`] = false;
			row[`role${ncol - 1}`] = true;
			data[nrow] = row;
			setData(data.slice());
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering');
		const formatter = cell => (<span>{cell}</span>);

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
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="125px" dataField="name" dataAlign="center" headerAlign="center">
								שם
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="165px" dataField="email" dataAlign="center" headerAlign="center">
								אימייל
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="85px" dataField="role1" dataAlign="center" headerAlign="center">
								תפקיד 1
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="85px" dataField="role2" dataAlign="center" headerAlign="center">
								תפקיד 2
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="85px" dataField="role3" dataAlign="center" headerAlign="center">
								תפקיד 3
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="85px" dataField="role4" dataAlign="center" headerAlign="center">
								תפקיד 4
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="85px" dataField="role5" dataAlign="center" headerAlign="center">
								תפקיד 5
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="85px" dataField="role6" dataAlign="center" headerAlign="center">
								תפקיד 6
							</TableHeaderColumn>
							<TableHeaderColumn columnClassName={ columnClassNameFormat } dataFormat={formatter} width="85px" dataField="role7" dataAlign="center" headerAlign="center">
								תפקיד 7
							</TableHeaderColumn>
						</BootstrapTable>
					</Box>
				</Flex>
			</div>
		);
	});
