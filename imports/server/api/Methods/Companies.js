import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import moment from 'moment';
import Events from '../Collections/Events';
import Hydrants from '../Collections/Hydrants';
import Static from '../Collections/Static';
import rateLimit from '../../../modules/server/rate-limit';

Meteor.methods({
	'companies.get.all': function getEventsH(p) {
		check(p, Object);
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
