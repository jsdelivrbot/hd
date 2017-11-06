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
});


//construct a Promise that will take 2500ms to resolve
// console.log("began running")
// let promise = new Promise((resolve)=>
// 	setTimeout(()=>{
// 		console.log("done running")
// 		resolve("I'm baaaack....")}, 2500))
// return Promise.await(promise);
