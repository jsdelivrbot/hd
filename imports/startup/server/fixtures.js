import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import seeder from './seeder';
import Hydrants from '../../server/api/Collections/Hydrants';
import Static from '../../server/api/Collections/Static';
import Events from '../../server/api/Collections/Events';
import { words, streets, cities } from './local/he';
import SimpleSchema from 'simpl-schema';

const Counts = new Mongo.Collection('Counts');

const rn = n => faker.random.number(n);

const randomHydrant = (ind) => {
	let sentence1 = '';
	for (let i = 0; i <= rn({ min: 5, max: 10 }); i += 1) {
		const temp = `${sentence1} ${words[rn(words.length)]}`;
		if (temp.length > 50) break;
		else sentence1 = temp;
	}
	let sentence2 = '';
	for (let i = 0; i <= rn({ min: 5, max: 10 }); i += 1) {
		const temp = `${sentence2} ${words[rn(words.length)]}`;
		if (temp.length > 100) break;
		else sentence2 = temp;
	}
	const dt = faker.date.past(1).toISOString();
	return Hydrants.schema.clean({
		companyId: 1,
		sim: rn(999999999),
		lat: Number((32.848439 + ((5000 - rn(10000)) * 0.000005)).toFixed(6)),
		lon: Number((35.117543 + ((5000 - rn(10000)) * 0.000005)).toFixed(6)),
		status: rn(5),
		updatedAt: dt,
		createdAt: dt,
		lastComm: faker.date.past(1).toISOString(),
		disableDate: faker.date.past(1).toISOString(),
		address: `${cities[rn(cities.length - 1)]} ${streets[rn(streets.length - 1)]} ${rn(99)}`,
		description: sentence1,
		disableText: sentence2,
		enabled: faker.random.boolean(),
		number: ind,
	});
};

const randomEvent = (hydrantId, ind) => {
	return {
		hydrantId,
		number: ind,
		code: rn(7),
		edata: faker.random.number(),
		createdAt: faker.date.past(1).toISOString(),
	};
};

export default function initDb() {
	Static.remove({});
	Static.insert({});
	Events.remove({});
	Hydrants.remove({});
	Counts.upsert('HydrantsSerialNumber', { $set: { next_val: 10000 } });
	Counts.upsert('EventsSerialNumber', { $set: { next_val: 10 } });

	console.log('starting');
	const first = (new Date()).getTime();
	console.log(first);

	let a;
	let r;

	a = [];
	for (let i = 0; i < 10000; i += 1) {
		a.push(randomHydrant(i));
	}
	r = Hydrants.batchInsert(a);

	console.log('hydrants length');
	console.log(r.length);

	a = [];
	for (let i = 0; i < r.length; i += 1) {
		for (let j = 0; j < 10; j += 1) {
			a.push(randomEvent(r[i], (i * 10) + j));
		}
	}
	r = Events.batchInsert(a);

	console.log('eevents length');
	console.log(r.length);

	const last = (new Date()).getTime();
	console.log(last);
	console.log('dif');
	console.log(last-first);


	seeder(Meteor.users, {
		environments: ['development', 'staging'],
		noLimit: true,
		wipe: false,
		data: [{
			email: 'a@a.a',
			password: 'aaaaaa',
			profile: {
				name: {
					first: 'משה',
					last: 'בן-משה',
				},
			},
			roles: ['admin'],
		}],
	});
}

//
// const eventsSeed = hydrantId => ({
// 	collection: Events,
// 	environments: ['development', 'staging'],
// 	noLimit: true,
// 	wipe: false,
// 	modelCount: 3,
// 	model() {
// 		return {
// 			hydrantId,
// 			code: rn(7),
// 			edata: faker.random.number(),
// 			createdAt: faker.date.past(1).toISOString(),
// 		};
// 	},
// });


// initDb();


// return;
// seeder(Hydrants, {
// 	environments: ['development', 'staging'],
// 	noLimit: true,
// 	wipe: true,
// 	modelCount: 100,
// 	model() {
// 		let sentence = '';
// 		for (let i = 0; i <= rn({ min: 5, max: 10 }); i += 1) {
// 			const temp = `${sentence} ${words[rn(words.length)]}`;
// 			if (temp.length > 50) break;
// 			else sentence = temp;
// 		}
// 		return {
// 			companyId: 1,
// 			sim: rn(999999999),
// 			lat: (32.848439 + ((5000 - rn(10000)) * 0.000005)).toFixed(6),
// 			lon: (35.117543 + ((5000 - rn(10000)) * 0.000005)).toFixed(6),
// 			status: rn(1),
// 			createdAt: faker.date.past(1).toISOString(),
// 			address: `${cities[rn(cities.length - 1)]} ${streets[rn(streets.length - 1)]} ${rn(99)}`,
// 			description: sentence,
// 			enabled: faker.random.boolean(),
// 			data(_id) {
// 				return eventsSeed(_id);
// 			},
// 		};
// 	},
// });
