import { Picker } from 'meteor/meteorhacks:picker';
import _ from 'lodash';
import moment from 'moment';
import Hydrants from '../../server/api/Collections/Hydrants';
import Events from '../../server/api/Collections/Events';

const testData = ({ sim, code, edata }) => {
	if (sim && code && edata) {
		if (sim > 0 && code > 0 && edata > 0) {
			return true;
		}
	}
	return false;
};

const calculateTotalFlow = ({ flowStartCode }) => {
	// Read last 1000 flow events
	const events = Events.find(
		{ code: { in: _.range(flowStartCode, flowStartCode + 3) } },
		{ fields: { createdAt: 1, code: 1, edata: 1 } },
		{ sort: { createdAt: -1 } },
		{ limit: 1000 }
	);

	// Take last flow-continue events
	const flowContinueEvents = _.takeWhile(events, { code: flowStartCode + 1 });

	// Are there are any flow-continue events
	if (flowContinueEvents.length >= 1) {

		// Read next
		const flowStartEvent = _.head(events);

		// Is it flow-start event
		if (flowStartEvent.code == flowStartCode) {
			return ({
				totalFlow: _.transform(flowContinueEvent),
				flowDuratin: flowStartEvent.createdAt,
			});
		}
	}
	return undefined;
};

const calculateFlowDuration = () => {

};

const update = ({ sim, code, edata }) => {
	// Message will be accepted only if a matching <hydrantKeyID> is found
	const hydrant = Hydrants.findOne({ sim }).fetch();
	if (!hydrant) return false;
	const { _id: hydrantId, status, lastComm } = hydrant;

	const newHydrant = {};
	const newEvent = { hydrantId, code };

	// Message will trigger a query testing if there is a company hydrant that has a LastComm date which is more than 24 hours old, triggering a status change
	if (moment(lastComm) < moment().subtract({ hours: 24 })) {
		// status <-- No Communication (inactive)
		newHydrant.status = 0;
	}

	// lastcom 72hours
	// update lastComm every hour
	// Message will update LastComm field of hydrant
	newHydrant.lastComm = moment().toISOString();

	// Message will trigger status change of hydrant if needed
	switch (code) {
		// All OK
		// max-frequency = 24 hours
		// status <-- NO CHANGE
		// edata <-- (edata = battery voltage)
		case 0:
			_.assign(newEvent, { edata });
			break;
		// Low Battery
		// max-frequency = 24 hours
		// status <-- Low Battery
		// edata <-- (edata = battery voltage)
		case 1:
			if (status == 0) {
				_.assign(newHydrant, { status: 1 });
			}
			_.assign(newEvent, { edata });
			break;

		// Abused
		// status <-- Abused event
		// max-frequency = 10 minutes
		// edata <-- Nothing
		case 2:
			if (status < 3) {
				_.assign(newHydrant, { status: 3 });
			}
			break;

		// Normal Flow Start flow rate
		// status <-- Normal Flow event
		// max-frequency = 10m minutes
		case 3:
			if (status < 4) {
				_.assign(newHydrant, { status: 4 });
			}
			break;

		// Normal Flow Continue flow rate
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		case 4:
			_.assign(newEvent, { edata });
			break;

		// Normal Flow End flow rate. sum -> estimated
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// totalFlow <-- sum of previous edata from flow start
		// flowDuration <-- delta time to flow start
		case 5:
			_.assign(newEvent, {
				totalFlow: calculateTotalFlow(),
				flowDuration: calculateFlowDuration(),
			});
			break;

		// Reverse Flow Start flow rate
		// status <-- Reverse Flow event
		// max-frequency = 10m minutes
		case 6:
			if (status < 4) {
				_.assign(newHydrant, { status: 4 });
			}
			break;

		// Reverse Flow Continue flow rate
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		case 7:
			_.assign(newEvent, { edata });
			break;

		// Reverse Flow End flow rate. sum -> estimated
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// totalFlow <-- sum of previous edata from flow start
		// flowDuration <-- delta time to flow start
		case 8:
			_.assign(newEvent, {
				totalFlow: calculateTotalFlow(),
				flowDuration: calculateFlowDuration(),
			});
			break;

		default: break;
	}


	Events.insert(newEvent);

	Hydrants.update({ _id: hydrantId }, { $set: newHydrant });

	return true;
};

Picker.route('/input', (params, req, res, next) => {
	const { query } = params;

	const { h: sim, e: code, d: edata } = query.params;
	if (testData({ sim, code, edata }) && update({ sim, code, edata })) {
		console.log('inserted events row');
	} else {
		console.log('inserting error row');
	}
	res.statusCode = 200;
	res.end('received input route');
});
