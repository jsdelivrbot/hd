import { Picker } from 'meteor/meteorhacks:picker';
import _ from 'lodash';
import Hydrants from '../../server/api/Collections/Hydrants';
import Events from '../../server/api/Collections/Events';
import moment from 'moment';

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
	const { _id: hydrantId, status } = hydrant;

	// Message will add a line to Events table if needed
	Events.insert({ hydrantId, code, edata });

	const newHydrant = {};

		// Message will update LastComm field of hydrant
	newHydrant.lastComm = moment().toISOString();

		// Message will trigger status change of hydrant if needed
	switch (code) {
		case 0:
			break;
		case 1:
			if (status == 0) newHydrant.status = 1;
			break;
		case 2:
			if (status < 3) newHydrant.status = 3;
			break;
		case 3:
			if (status < 4) newHydrant.status = 4;
			break;
		case 4:
			if (status < 4) newHydrant.status = 4;
			break;
		case 5:
			if (status < 4) newHydrant.status = 4;
			console.log('will calculate total water flow from start of event and enter to events EstimatedFlow field');
			break;
		case 6:
			newHydrant.status = 5;
			break;
		case 7:
			console.log('No status change');
			console.log('enter length(Time in minutes) of event since start to EventData field');
			break;
		default: break;
	}

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
