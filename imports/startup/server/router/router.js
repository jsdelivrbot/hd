import { Meteor } from 'meteor/meteor';
import { Picker } from 'meteor/meteorhacks:picker';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import test from 'tape';

import Hydrants from '../../../server/api/Collections/Hydrants';
import Events from '../../../server/api/Collections/Events';
import Errors from '../../../server/api/Collections/Errors';
import { sleep } from '../../../server/Utils/utils';
import { initTestDb } from '../fixtures';
import sendNotifications from '../google';

const calculateFlow = ({ flowEndCode }) => {
	const flowContinueCode = flowEndCode - 1;
	const flowStartCode = flowEndCode - 2;

	// Read last 1000 flow events
	const events = Events.find(
		{
			code: { $in: [flowStartCode, flowContinueCode, flowEndCode] }
		}, {
			fields: { createdAt: 1, code: 1, edata: 1 },
			sort: { createdAt: -1 },
			limit: 1000
		}
	).fetch();

	// Take last flows
	const flows = _
		.chain(events)
		.takeWhile({ code: flowContinueCode })
		.map('edata')
		.value();

	// Any flow-continue events?
	if (flows.length < 1) {
		flows[0] = 0;
		// return { error: `Event received, no flow continue ${flowContinueCode} event` };
	}

	// Read one before
	// Is there flow-start event
	const startEvent = events[flows.length];
	if (!startEvent || startEvent.code != flowStartCode) return { error: `Event received, no flow start ${flowStartCode} event` };

	const { createdAt } = startEvent;
	return ({
		flowTotal: _.sum(flows) + events[flows.length].edata,
		flowDuration: moment().diff(moment(createdAt), 'seconds'),
	});
};

const updateDb = ({ sim, code, edata }) => {
	if (!_.isEmpty(edata)) {
		edata = Number(edata);
		if (!_.isFinite(edata)) return { error: 'Event received, faulty edata parameter' };
	}
	code = Number(code);

	// Message will be accepted only if a matching <hydrantKeyID> is found
	const hydrant = Hydrants.findOne({ sim });
	if (!hydrant) return { error: 'Event received, sim not found' };
	const { _id: hydrantId, status } = hydrant;

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
			if (!_.isFinite(edata)) return { error: 'Event received, case 0 missing edata parameter' };
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
			if (!_.isFinite(edata)) return { error: 'Event received, case 1 missing edata parameter' };
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
			if (!_.isFinite(edata)) return { error: 'Event received, case 3 missing edata parameter' };
			_.assign(newEvent, { edata });
			break;

		// Normal Flow Continue flow rate
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		case 4:
			if (!_.isFinite(edata)) return { error: 'Event received, case 4 missing edata parameter' };
			_.assign(newEvent, { edata });
			break;

		// Normal Flow End flow rate. sum -> estimated
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// flowTotal <-- sum of previous edata from flow start
		// flowDuration <-- delta time to flow start
		case 5:
			({ error, flowTotal, flowDuration } = calculateFlow({ flowEndCode: 5 }));
			if (error) return { error };
			_.assign(newEvent, { flowTotal, flowDuration });
			break;

		// Reverse Flow Start flow rate
		// status <-- Reverse Flow event
		// max-frequency = 10m minutes
		case 6:
			if (status < 4) {
				_.assign(newHydrant, { status: 4 });
			}
			if (!_.isFinite(edata)) return { error: 'Event received, case 6 missing edata parameter' };
			_.assign(newEvent, { edata });
			break;

		// Reverse Flow Continue flow rate
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		case 7:
			if (!_.isFinite(edata)) return { error: 'Event received, case 7 missing edata parameter' };
			_.assign(newEvent, { edata });
			break;

		// Reverse Flow End flow rate. sum -> estimated
		// status <-- NO CHANGE (change from srs)
		// max-frequency = 10 minutes
		// flowTotal <-- sum of previous edata from flow start
		// flowDuration <-- delta time to flow start
		case 8:
			({ error, flowTotal, flowDuration } = calculateFlow({ flowEndCode: 8 }));
			if (error) return { error };
			_.assign(newEvent, { flowTotal, flowDuration });
			break;

		default:
			return { error: 'Event received, faulty code parameter' };
	}

	const eventId = Events.insert(newEvent);
	Hydrants.update({ _id: hydrantId }, { $set: newHydrant });

	console.log('newHydrant', newHydrant);
	console.log('newEvent', newEvent);

	return { eventId };
};

Picker.route('/input', (params, req, res, next) => {
	const { h: sim, c: code, d: edata } = params.query;
	const { error, eventId } = updateDb({ sim, code, edata });
	if (error) {
		console.log('error');
		console.log(error);
		Errors.insert({ description: error });
	} else {
		sendNotifications({ eventId });
	}
	res.statusCode = 200;
	res.end('received input route');
});


// Message will trigger a query testing if there is a company hydrant that has a LastComm date which is more than 24 hours old, triggering a status change
const updateHydrantStatusEveryHour = () => {
	console.log('running no communication check, updated:');
	// status=2=No communication
	console.log(Hydrants.update(
		{ $or: [
			{ lastComm: { $exists: false } },
			{ lastComm: { $lt: new Date(moment().subtract({ days: 3 }).toDate()) } }
		] },
		{ $set: { status: 2 } },
		{ multi: true }
	));
};

Meteor.setInterval(updateHydrantStatusEveryHour, 3600 * 1000);

async function runningTest() {
	initTestDb();
	// // Update status with no communication
	// Hydrants.update({ sim: '111' }, { $set: { lastComm: moment().subtract({ hours: 73 }).toDate() } });
	// Hydrants.update({ sim: '222' }, { $set: { lastComm: moment().subtract({ hours: 71 }).toDate() } });
	// updateHydrantStatusEveryHour();
	// console.log('should be: status == 2');
	// console.log(Hydrants.findOne({ sim: '111' }).status);
	// console.log('should be: status != 2');
	// console.log(Hydrants.findOne({ sim: '222' }).status);
	// console.log('should be: status != 2');
	// console.log(Hydrants.findOne({ sim: '333' }).status);
	//
	// Faulty parameters
	console.log('should be: faulty edata parameter');
	await axios.get('http://localhost:3000/input?h=111&c=0&d=a');

	console.log('should be: sim not found');
	await axios.get('http://localhost:3000/input?h=99999999999&c=0&d=0');

	console.log('should be: case 0 missing edata parameter');
	await axios.get('http://localhost:3000/input?h=111&c=0&d=');

	console.log('should be: case 1 missing edata parameter');
	await axios.get('http://localhost:3000/input?h=111&c=1&d=');

	console.log('should be: case 3 missing edata parameter');
	await axios.get('http://localhost:3000/input?h=111&c=3&d=');

	console.log('should be: case 4 missing edata parameter');
	await axios.get('http://localhost:3000/input?h=111&c=4&d=');

	console.log('should be: case 6 missing edata parameter');
	await axios.get('http://localhost:3000/input?h=111&c=6&d=');

	console.log('should be: case 7 missing edata parameter');
	await axios.get('http://localhost:3000/input?h=111&c=7&d=');

	console.log('should be: faulty code parameter');
	await axios.get('http://localhost:3000/input?h=111&c=9&d=0');
	//
	//
	// // Insertations
	// console.log('should be: inserting code 0 ok event, no status change');
	// await axios.get('http://localhost:3000/input?h=111&c=0&d=0');
	//
	// console.log('should be: inserting code 0 low battery event, updating status 1');
	// await axios.get('http://localhost:3000/input?h=111&c=1&d=0');
	//
	// console.log('should be: inserting code 0 abused event, updating status 3');
	// await axios.get('http://localhost:3000/input?h=111&c=2&d=');
	//
	//

	console.log('Normal Flow');
	Events.remove({});
	// console.log('should be: no flow continue 4 event');
	console.log('should be: no flow start 3 event');
	await axios.get('http://localhost:3000/input?h=111&c=5&d=');

	console.log('should be: inserting code 4 flow continue event, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=4&d=50');

	console.log('should be: no flow start 3 event');
	await axios.get('http://localhost:3000/input?h=111&c=5&d=');

	console.log('should be: inserting code 3 flow start event, updating status 4');
	await axios.get('http://localhost:3000/input?h=111&c=3&d=40');
	await sleep(10000);

	console.log('should be: inserting code 4 flow continue event, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=4&d=50');
	await sleep(10000);
	console.log('should be: inserting code 4 flow continue event, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=4&d=70');
	await sleep(10000);

	console.log('should be: inserting code 5 flow end event, flowTotal=160 flowDuration=30, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=5&d=');

	console.log('Reverse Flow');
	Events.remove({});
	// console.log('should be: no flow continue 7 event');
	console.log('should be: no flow start 6 event');
	await axios.get('http://localhost:3000/input?h=111&c=8&d=');

	console.log('should be: inserting code 7 flow continue event, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=7&d=50');

	console.log('should be: no flow start 6 event');
	await axios.get('http://localhost:3000/input?h=111&c=8&d=');

	console.log('should be: inserting code 6 flow start event, updating status 4');
	await axios.get('http://localhost:3000/input?h=111&c=6&d=40');
	await sleep(10000);

	console.log('should be: inserting code 7 flow continue event, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=7&d=50');
	await sleep(10000);

	console.log('should be: inserting code 7 flow continue event, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=7&d=70');
	await sleep(10000);

	console.log('should be: inserting code 8 flow end event, flowTotal=160 flowDuration=30, no status change');
	await axios.get('http://localhost:3000/input?h=111&c=8&d=');
}

// Meteor.setTimeout(runningTest, 1000);
