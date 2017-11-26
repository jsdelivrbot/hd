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
const update = ({ sim, code, edata }) => {
	// Message will be accepted only if a matching <hydrantKeyID> is found
	const hydrant = Hydrants.findOne({ sim }).fetch();
	if (!hydrant) return false;
	const { _id: hydrantId, status, lastComm } = hydrant;

	const newHydrant = {};

	// Message will trigger a query testing if there is a company hydrant that has a LastComm date which is more than 24 hours old, triggering a status change
	if (moment(lastComm) < moment().subtract(24, 'hours')) {
		// status <-- No Communication (inactive)
		newHydrant.status = 0;
	}

	///////////// update lastComm every hour
	// Message will update LastComm field of hydrant
	newHydrant.lastComm = moment().toISOString();

	// Message will trigger status change of hydrant if needed
	let estimatedFlow;
	switch (code) {
		// All OK
		// edata <-- (edata = battery voltage)
		// maximal frequency = 24 hours
		// status <-- NO CHANGE
		// edata <-- (edata = flow rate)
		// edata <-- 0
		// flowSum <-- 0
		// flowSum <-- previous flowSum + edata
		// flowDuration <-- 0
		// flowDuration <-- previous flowDuration + calculate duration delta
		case 0:
			break;
		// Low Battery lb
		case 1:
			if (status == 0) newHydrant.status = 1;
			// status <-- Low Battery
			break;
		// Abused 0
		case 2:
			if (status < 3) newHydrant.status = 3;
			// status <-- Abused event
			break;
		// Normal Flow Start flow rate
		case 3:
			if (status < 4) newHydrant.status = 4;
			// status <-- Normal Flow event
			break;
		// Normal Flow Continue flow rate
		case 4:
			if (status < 4) newHydrant.status = 4;
			// status <-- Normal Flow event
			break;
		// Normal Flow End flow rate. sum -> estimated
		case 5:
			// * Will calculate total water flow from start of event and enter to events Estimated Flow field
			estimatedFlow = 0;
			if (status < 4) newHydrant.status = 4;
			// status <-- Normal Flow event
			break;
		// Reverse Flow Start, 0
		case 6:
			newHydrant.status = 5;
			// status <-- Reverse Flow event
			break;
		// Reverse Flow End, 0
		case 7:
			estimatedFlow = 0;
			// * No status change
			// * Enter length(Time in minutes) of event since start to EventData field
			break;
		default: break;
	}

	Events.find(
		{ code: { in: [4, 3] } },
		{ fields: { createdAt: 1, code: 1 } },
		{ sort: { createdAt: -1 } },
		{ limit: 1000 }
	);


	// * What about the return value ?  200 - everytime
	// * How ofthen the event transmitted - once a day regularly, at flow 10minutes, abused - 10minutes, lb - daily
	// lastcom 72hours

	// write errors to database


	Events.insert({ hydrantId, code, edata, estimatedFlow });

	Hydrants.update({ _id: hydrantId }, { $set: newHydrant });

	return true;
};

Picker.route('/input', (params, req, res, next) => {
	const { query } = params;

	const { h: sim, e: code, d: edata } = query.params;
	if (testData({ sim, code, edata }) && update({ sim, code, edata })) {
		res.end('success');
	} else {
		res.end('nosuccess');
	}
});
