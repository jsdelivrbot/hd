import { Meteor } from 'meteor/meteor';
import { Picker } from 'meteor/meteorhacks:picker';
import _ from 'lodash';
import moment from 'moment';
import Hydrants from '../../server/api/Collections/Hydrants';
import Events from '../../server/api/Collections/Events';
import Errors from '../../server/api/Collections/Errors';

const calculateFlow = ({ flowEndCode }) => {
	const flowContinueCode = flowEndCode - 1;
	const flowStartCode = flowEndCode - 2;

	// Read last 1000 flow events
	const events = Events.find(
		{ code: { in: [flowStartCode, flowContinueCode, flowEndCode] } },
		{ fields: { createdAt: 1, code: 1, edata: 1 } },
		{ sort: { createdAt: -1 } },
		{ limit: 1000 }
	);

	// Take last flows
	const flows = _
		.chain(events)
		.takeWhile({ code: flowContinueCode })
		.map('edata')
		.value();

	// Any flow-continue events?
	if (flows.length < 1) return { error: 'Event received, no flow continue event' };

	// Read one before
	const { code, startCreatedAt } = _.head(events);

	// Is it flow-start event
	if (code != flowStartCode) return { error: 'Event received, no flow start event' };

	return ({
		flowTotal: _.sum(flows),
		flowDuration: moment().diff(moment(startCreatedAt), 'seconds').toDate(),
	});
};

const updateDb = ({ sim, code, edata }) => {
	if (!_.isEmpty(edata)) {
		edata = Number(edata);
		if (!_.isNumber(edata)) return { error: 'Event received, faulty edata parameter' };
	}

	console.log('edata');
	console.log(edata);
	code = Number(code);

	// Message will be accepted only if a matching <hydrantKeyID> is found
	const hydrant = Hydrants.findOne({ sim });
	if (!hydrant) return { error: 'Event received, sim not found' };
	const { _id: hydrantId, status, lastComm } = hydrant;

	// Message will update LastComm field of hydrant
	const newHydrant = { lastComm: moment().toDate() };
	const newEvent = { hydrantId, code };

	// Message will trigger status change of hydrant if needed
	let flowTotal, flowDuration, error;
	switch (code) {
		// All OK
		// max-frequency = 24 hours
		// status <-- NO CHANGE
		// edata <-- (edata = battery voltage)
		case 0:
			if (!_.isNumber(edata)) return { error: 'Event received, missing edata parameter' };
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
			if (!_.isNumber(edata)) return { error: 'Event received, missing edata parameter' };
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
			if (!_.isNumber(edata)) return { error: 'Event received, missing edata parameter' };
			_.assign(newEvent, { edata });
			break;

		// Normal Flow End flow rate. sum -> estimated
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// flowTotal <-- sum of previous edata from flow start
		// flowDuration <-- delta time to flow start
		case 5:
			({ error, flowTotal, flowDuration } = calculateFlow({ flowEndCode: 5 }));
			if (!error) _.assign(newEvent, { flowTotal, flowDuration });
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
			if (!_.isNumber(edata)) return { error: 'Event received, missing edata parameter' };
			_.assign(newEvent, { edata });
			break;

		// Reverse Flow End flow rate. sum -> estimated
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// flowTotal <-- sum of previous edata from flow start
		// flowDuration <-- delta time to flow start
		case 8:
			({ error, flowTotal, flowDuration } = calculateFlow({ flowEndCode: 8 }));
			if (!error) _.assign(newEvent, { flowTotal, flowDuration });
			break;

		default:
			return { error: 'Event received, faulty parameters' };
	}

	Events.insert(newEvent);
	Hydrants.update({ _id: hydrantId }, { $set: newHydrant });

	return {};
};

Picker.route('/input', (params, req, res, next) => {
	const { h: sim, e: code, d: edata } = params.query;
	const { error } = updateDb({ sim, code, edata });
	if (error) {
		console.log('inserting error row');
		console.log('error');
		console.log(error);
		Errors.insert({ description: error });
	} else {
		console.log('inserted events row');
	}
	res.statusCode = 200;
	res.end('received input route');
});


// Message will trigger a query testing if there is a company hydrant that has a LastComm date which is more than 24 hours old, triggering a status change
const updateHydrantStatusEveryHour = () => {
	console.log('running no communication check');
	// status=2=No communication
	Hydrants.update({ lastComm: { lt: moment().subtract({ hours: 72 }).toDate() } },
		{ $set: { status: 2 } }
	);
};
Meteor.setInterval(updateHydrantStatusEveryHour, 3600 * 1000);
