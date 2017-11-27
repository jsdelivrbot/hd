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
			break;

		// Low Battery
		// max-frequency = 24 hours
		// status <-- Low Battery
		// edata <-- (edata = battery voltage)
		case 1:
			if (status == 0) newHydrant.status = 1;
			break;

		// Abused
		// status <-- Abused event
		// max-frequency = 10 minutes
		// edata <-- 0
		case 2:
			if (status < 3) newHydrant.status = 3;
			break;

		// Normal Flow Start flow rate
		// status <-- Normal Flow event
		// max-frequency = 10m minutes
		// edata <-- (edata = flow rate)
		// flowSum <-- 0
		// flowDuration <-- 0
		case 3:
			if (status < 4) newHydrant.status = 4;
			break;

		// Normal Flow Continue flow rate
		// status <-- NO CHANGE *change from srs
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		// flowSum <-- previous flowSum + edata
		// flowDuration <-- previous flowDuration + calculate duration delta
		case 4:
			if (status < 4) newHydrant.status = 4;
			break;

		// Normal Flow End flow rate. sum -> estimated
		// status <-- NO CHANGE *change from srs
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		// flowSum <-- previous flowSum + edata
		// flowDuration <-- previous flowDuration + calculate duration delta
		case 5:
			if (status < 4) newHydrant.status = 4;
			break;

		// Reverse Flow Start, 0
		// status <-- Reverse Flow event
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		// flowSum <-- 0
		// flowDuration <-- 0
		case 6:
			newHydrant.status = 5;
			break;

		// Reverse Flow End, 0
		// status <-- NO CHANGE *change from srs
		// max-frequency = 10 minutes
		// edata <-- (edata = flow rate)
		// flowSum <-- previous flowSum + edata
		// flowDuration <-- previous flowDuration + calculate duration delta
		case 7:
			break;

		default: break;
	}

	Events.find(
		{ code: { in: [4, 3] } },
		{ fields: { createdAt: 1, code: 1 } },
		{ sort: { createdAt: -1 } },
		{ limit: 1000 }
	);

	Events.insert({ hydrantId, code, edata, estimatedFlow });

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
