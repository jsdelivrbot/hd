import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import moment from 'moment';
import Events from './Events';
import Static from '../Utility/Static';
import rateLimit from '../../../modules/server/rate-limit';
// import moment from 'moment';
// function mongoDateBack(keyDate) {
// }

function buildFilter(p) {
	const filter = {};
	console.log('events uploading');
	const choose = { 0: 1, 1: 7, 2: 30, 3: 90, 4: 365 };
	filter.createdAt = { $gt: moment().subtract(choose[p.createdAt] || 10000, 'days').toISOString() };

	if (!_.isEmpty(p.code)) {
		filter.code = { $in: _.keys(p.code).map(k => _.toNumber(k)) };
	}

	return filter;
}


Meteor.methods({
	'events.get.init': function getEventsH() {
		const array = Events.aggregate([
			{ $match: { code: 2 } },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		return {
			types: Static.findOne({}).types,
			countHuntUnits: _.get(array, '[0].count', 0),
		};
	},
	'events.get.lenQuery': function getEventsH(p) {
		check(p, Object);
		const { filter } = p;
		const array = Events.aggregate([
			{ $match: buildFilter(filter) },
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		return _.get(array, '[0].count', 0);
	},
	'events.get.data': function getEventsH(p) {
		check(p, Object);
		const { filter, sort, skip } = p;

		return Events.aggregate([
			{ $match: buildFilter(filter) },
			{ $sort: { [sort.name]: sort.order } },
			{ $skip: skip },
			{ $limit: 12 },
			{ $lookup: {
				from: 'Hydrants',
				localField: 'hydrantId',
				foreignField: '_id',
				as: 'h'
			} },
			{ $unwind: '$h' },
			{ $project: {
				createdAt: 1,
				number: 1,
				code: 1,
				edata: 1,
				hydrantNumber: '$h.number',
				description: '$h.description',
			} }], { allowDiskUse: true });
	},
});


rateLimit({
	methods: [
		'hydrants.insert',
		'hydrants.update',
		'hydrants.remove',
	],
	limit: 5,
	timeRange: 1000,
});




//construct a Promise that will take 2500ms to resolve
// console.log("began running")
// let promise = new Promise((resolve)=>
// 	setTimeout(()=>{
// 		console.log("done running")
// 		resolve("I'm baaaack....")}, 2500))
// return Promise.await(promise);
