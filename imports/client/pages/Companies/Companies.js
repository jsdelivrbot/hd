
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
	withHandlers,
	compose,
	withStateHandlers,
	lifecycle,
} from 'recompose';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import { Flex, Box } from 'reflexbox';
import '../../stylesheets/table.scss';

import './Css/Companies.scss';

import {
	reactiveVar,
} from '../../Storage/Storage';

export default compose(
	withTracker(() => {
		console.log('tracker Companies');
		return {
			company: reactiveVar.get().company || { key: 1, number: 1, name: 'עין אפק 1' },
		};
	}),
	withStateHandlers(
		({ company }) => ({
			data: [],
			initialized: false,
			selected: [company.key],
		}), {
			setSelected: () => (row) => {
				reactiveVar.set({ company: row });
				console.log('reactiveVar.get()');
				console.log(reactiveVar.get());
				return { selected: [row.key] };
			},
			setData: () => data => ({ data }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	withHandlers({
		onSelect: ({ selected, setSelected }) => (row, isSelected) => {
			console.log('row');
			console.log(row);
			console.log('isSelected');
			console.log(isSelected);
			console.log('selected');
			console.log(selected);
			if (isSelected) setSelected(row);
			return isSelected;
		},
	}),
	lifecycle({
		componentDidMount() {
			console.log('initializing');
			this.props.setData([
				{ key: 0, number: 0, name: 'תאגיד עין אפק 0' },
				{ key: 1, number: 1, name: 'תאגיד עין אפק 1' },
				{ key: 2, number: 2, name: 'תאגיד עין אפק 2' },
				{ key: 3, number: 3, name: 'תאגיד עין אפק 3' },
				{ key: 4, number: 4, name: 'תאגיד עין אפק 4' },
				{ key: 5, number: 5, name: 'תאגיד עין אפק 5' },
				{ key: 6, number: 6, name: 'תאגיד עין אפק 6' },
				{ key: 7, number: 7, name: 'תאגיד עין אפק 7' },
				{ key: 8, number: 8, name: 'תאגיד עין אפק 8' },
			]);
			this.props.setInitialized(true);
		},
	}),
)(
	(p) => {
		console.log('rendering');
		console.log('p.selected');
		console.log(p.selected);
		const formatter = cell => (<span>{cell}</span>);

		return (
			<div className="hydrants">
				<Flex>
					<Box w={11 / 12}>
						<BootstrapTable
							keyField="key"
							containerClass="table_container_class"
							tableContainerClass="table_class"
							data={p.data}
							remote
							selectRow={{
								mode: 'radio',
								hideSelectColumn: true,
								clickToSelect: true,
								bgColor: '#0c98e2',
								onSelect: p.onSelect,
								selected: p.selected,
							}}
							height="600px"
						>
							<TableHeaderColumn dataFormat={formatter} width="125px" dataField="name" dataAlign="center" headerAlign="center">
								שם תאגיד
							</TableHeaderColumn>
						</BootstrapTable>
					</Box>
				</Flex>
			</div>
		);
	});
