import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import moment from 'moment';
import Companies from '../Collections/Companies';
import rateLimit from '../../../modules/server/rate-limit';

Meteor.methods({
	'companies.get.all': function anon() {
		return Companies.find({}).fetch();
	},
	'companies.get.data.one': function anon(p) {
		check(p, Object);
		const { filter } = p;
		return Companies.findOne({ _id: filter._id });
	},
});

Meteor.methods({
	'companies.insert': function anon(doc) {
		check(doc, Object);
		console.log('inserting');
		try {
			console.log('ok');
			return Companies.insert({ ...doc });
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'companies.update': function anon(doc) {
		check(doc, Object);
		console.log('updating');
		try {
			console.log('ok');
			const _id = doc._id;
			Companies.update(_id, { $set: doc });
			return _id; // Return _id so we can redirect to document after update.
		} catch (exception) {
			console.log(exception);
			throw new Meteor.Error('500', exception);
		}
	},
	'companies.remove': function anon(_id) {
		check(_id, String);
		try {
			return Companies.remove(_id);
		} catch (exception) {
			throw new Meteor.Error('500', exception);
		}
	},
});



//construct a Promise that will take 2500ms to resolve
// console.log("began running")
// let promise = new Promise((resolve)=>
// 	setTimeout(()=>{
// 		console.log("done running")
// 		resolve("I'm baaaack....")}, 2500))
// return Promise.await(promise);
