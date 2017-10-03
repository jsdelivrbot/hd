/* eslint-disable no-param-reassign */

import React from 'react';
import { Alert } from 'react-bootstrap';
import {
	mapProps,
	setDisplayName,
	compose,
	renderComponent,
	branch,
} from 'recompose';
import withLog from '@hocs/with-log';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import EventsCollection from '../../../api/Events/Events';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import SubManager from '../../../api/Utility/client/SubManager';
import { getSelectedHydrants } from '../../Storage/Storage';

import '../../stylesheets/table.scss';

const NotFound = () => (<Alert bsStyle="warning">אין אירועים!</Alert>);

const eventCodes = {
	0: 'OK',
	1: 'בטריה ריקה',
	2: 'מוטרד',
	3: 'תחילת זרימה רגילה',
	4: 'המשך זרימה רגילה',
	5: 'סיום זרימה רגילה',
	6: 'תחילת זרימה הפוכה',
	7: 'סיום זרימה הפוכה',
};

export default compose(
	meteorData(() => {
		const selectedHydrants = getSelectedHydrants();
		console.log(selectedHydrants);
		const subscription1 = SubManager.subscribe('events');
		const dataE = EventsCollection.find({ hydrantId: selectedHydrants }).fetch();
		const subscription2 = SubManager.subscribe('hydrants');
		const dataH = HydrantsCollection.find().fetch();
		return {
			dataE,
			dataH,
			loading: !subscription1.ready() || !subscription2.ready(),
			nodata: !dataE.length || !dataH.length,
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	branch(p => p.nodata, renderComponent(NotFound)),
	mapProps(({ dataE, dataH }) => {
		dataE = new Proxy(dataE, {
			get(obj, prop) {
				if (isNaN(prop)) return obj[prop];
				const row = _.cloneDeep(obj[prop]);
				const hRow = dataH.find(r => r._id === obj[prop].hydrantId);
				row.hydrantNumber = hRow ? hRow.number : ' ';
				row.createdAt = _.replace((new Date(row.createdAt)).toLocaleString('he-IL'), ',', '');
				row.code = eventCodes[row.code];
				return row;
			},
		});
		return { dataE };
	}),
	withLog((p) => { console.log(p); return ''; }),
	setDisplayName('Events')
)(props => (
	<div className="Events">
		<div style={{ height: 20 }} />
		<BootstrapTable data={props.dataE} maxHeight="650px" striped hover>
			<TableHeaderColumn isKey dataSort dataField="hydrantNumber" dataAlign="center" headerAlign="right">מספר הידרנט</TableHeaderColumn>
			<TableHeaderColumn dataSort dataField="number" dataAlign="center" headerAlign="right">מספר אירוע</TableHeaderColumn>
			<TableHeaderColumn dataSort dataField="createdAt" dataAlign="center" headerAlign="right">תאריך</TableHeaderColumn>
			<TableHeaderColumn dataSort dataField="code" dataAlign="center" headerAlign="right">קוד אירוע</TableHeaderColumn>
			<TableHeaderColumn dataSort dataField="edata" dataAlign="center" headerAlign="right">מידע</TableHeaderColumn>
		</BootstrapTable>
	</div>
));
