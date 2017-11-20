
import React from 'react';
import { Meteor } from 'meteor/meteor';
import {
	withHandlers,
	compose,
	withStateHandlers,
	lifecycle,
	branch,
	renderComponent,
} from 'recompose';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Button } from 'react-bootstrap';
import { Flex, Box } from 'reflexbox';
import Loader from 'react-loader-advanced';

import Loading from '../../components/LoginLayoutNavigation/Loading/Loading';

import '../../stylesheets/table.scss';
import './Css/Companies.scss';

export default compose(
	withStateHandlers(
		p => ({
			data: [],
			initialized: false,
			loading: false,
			selected: [p.company._id],
		}), {
			setSelected: ({}, p) => (row) => {
				p.setCompany(row);
				Meteor.callPromise('user.set.companyId', row._id);
				return { selected: [row._id] };
			},
			setData: () => data => ({ data }),
			setLoading: () => loading => ({ loading }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	withHandlers({
		onSelect: p => (row, isSelected) => {
			if (isSelected) p.setSelected(row);
			return isSelected;
		},
	}),
	lifecycle({
		async componentDidMount() {
			console.log('initializing');
			const p = this.props;
			p.setLoading(true);
			const data = await Meteor.callPromise('companies.get.all');
			p.setData(data);
			p.setLoading(false);
			console.log('initialized');
			p.setInitialized(true);
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering');
		const formatName = cell => (<span>{cell}</span>);
		const formatView = cell => (
			<span>
				<Button
					bsStyle="primary"
					onClick={() => p.history.push(`${p.match.url}/${cell}`)}
					block
				>פתח</Button>
			</span>
		);

		return (
			<div className="companies">
				<Flex>
					<Box w={11 / 12}>
						<Loader show={p.loading} message={Loading()} backgroundStyle={{ backgroundColor: 'transparent' }}>
							<BootstrapTable
								keyField="_id"
								containerClass="table_container_class"
								tableContainerClass="table_class"
								data={p.data}
								remote
								selectRow={{
									mode: 'radio',
									hideSelectColumn: false,
									clickToSelect: false,
									// bgColor: '#0c98e2',
									onSelect: p.onSelect,
									selected: p.selected,
								}}
								height="600px"
							>
								<TableHeaderColumn
									dataFormat={formatName}
									// width="125px"
									dataField="name"
									dataAlign="center"
									headerAlign="center"
								>
									שם תאגיד
								</TableHeaderColumn>
								<TableHeaderColumn
									dataFormat={formatView}
									width="125px"
									dataField="_id"
									dataAlign="center"
									headerAlign="center"
								>
									<Button
										bsStyle="primary"
										block
										onClick={() => p.history.push(
											`${p.match.url}/new`
										)}
									>
										חדש
									</Button>
								</TableHeaderColumn>
							</BootstrapTable>
						</Loader>
					</Box>
				</Flex>
			</div>
		);
	});
