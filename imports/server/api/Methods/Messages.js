import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import moment from 'moment';
import Events from '../Collections/Events';
import Messages from '../Collections/Messages';
import Hydrants from '../Collections/Hydrants';
import Static from '../Collections/Static';
import rateLimit from '../../Utils/rate-limit';

Meteor.methods({
	'messages.get.from.date': function anon(p) {
		check(p, Object);
		const ecodes = Static.findOne({}).types.code;
		return Messages.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $match: { $gt: p.date } },
			{ $lookup: {
				from: 'Events',
				localField: 'eventId',
				foreignField: '_id',
				as: 'e'
			} },
			{ $unwind: '$e' },
			{ $lookup: {
				from: 'Hydrants',
				localField: '$e.hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $match: { '$h.companyId': p.companyId } },
			{ $project: {
				createdAt: 1,
				eventId: 1,
				code: '$e.code',
				codeText: { $arrayElemAt: [ ecodes, '$e.code' ] },
				edata: '$e.edata',
				hydrantNumber: '$h.number',
				lat: '$h.lat',
				lon: '$h.lon',
				address: '$h.address',
			} },
		], { allowDiskUse: true });
	},
});

rateLimit({
	methods: [
		'messages.get'
	],
	limit: 2,
	timeRange: 1000,
});
