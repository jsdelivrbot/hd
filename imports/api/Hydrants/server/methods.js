import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import _ from 'lodash';
import Hydrants from './Hydrants';
import rateLimit from '../../../modules/rate-limit';

Meteor.methods({
	'map.get.init': function mapGetInit() {
		const array = Hydrants.aggregate([
			{ $group: {
				_id: null,
				count: { $sum: 1 }
			} },
		]);
		return _.get(array, '[0].count', 0);
	},
	'map.get.data': function mapGetData(p) {
		check(p, Object);
		const { bounds } = p;
		console.log('getting map in bounds');
		console.log(bounds);
		const { east, west, north, south } = bounds;
		return Hydrants.aggregate([
			{ $match: { $and: [{ lat: { $gt: south, $lt: north } }, { lon: { $gt: west, $lt: east } }] } },
			{ $limit: 30 },
			{ $project: {
				lat: 1,
				lon: 1,
				status: 1,
				address: 1,
				number: 1,
			} }]);
	},
	'hydrants.insert': function hydrantsInsert(doc) {
		check(doc, Match.Any);
		console.log('inserting');
		try {
			console.log('ok');
			return Hydrants.insert({ ...doc });
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.update': function hydrantsUpdate(doc) {
		check(doc, Match.Any);
		console.log('updating');
		try {
			console.log('ok');
			const hydrantId = doc._id;
			Hydrants.update(hydrantId, { $set: doc });
			return hydrantId; // Return _id so we can redirect to document after update.
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'hydrants.remove': function hydrantsRemove(hydrantId) {
		check(hydrantId, Match.Any);
		try {
			return Hydrants.remove(hydrantId);
		} catch (exception) {
			throw new Meteor.Error('500', exception);
		}
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
