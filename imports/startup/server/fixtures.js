import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import faker from 'faker';
import moment from 'moment';
import _ from 'lodash';
import seeder from './seeder';
import Hydrants from '../../server/api/Collections/Hydrants';
import Companies from '../../server/api/Collections/Companies';
import Static from '../../server/api/Collections/Static';
import Events from '../../server/api/Collections/Events';
import { words, streets, cities } from './local/he';
import Devices from '../../server/api/Collections/Devices';
import Messages from '../../server/api/Collections/Messages';
import Errors from '../../server/api/Collections/Errors';

const Counts = new Mongo.Collection('Counts');

const rn = n => faker.random.number(n);

const fakeSentence = (len) => {
	let sentence = '';
	for (let i = 0; i <= rn({ min: 5, max: 10 }); i += 1) {
		const temp = `${sentence} ${words[rn(words.length)]}`;
		if (temp.length > len) break;
		else sentence = temp;
	}
	return sentence;
};

const fakeAddress = () => `${cities[rn(cities.length - 1)]} ${streets[rn(streets.length - 1)]} ${rn(99)}`;

const randomHydrant = (ind, sim) => {
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
	const dt = faker.date.past(1);
	const enabled = faker.random.boolean();
	const companies = Companies.find({}).fetch();
	const obj = {
		companyId: companies[rn(companies.length - 1)]._id,
		sim: sim ? sim.toString() : rn(999999999).toString(),
		status: sim ? 0 : rn({ min: 0, max: 5 }),
		updatedAt: dt,
		createdAt: dt,
		enabled,
		number: ind,
	};
	if (faker.random.boolean() && !sim) obj.lastComm = faker.date.past(1);
	if (faker.random.boolean()) obj.disableText = fakeSentence(100);
	if (faker.random.boolean()) obj.description = fakeSentence(50);
	if (faker.random.boolean()) obj.bodyBarcode = rn(999999999).toString();
	if (faker.random.boolean()) obj.batchDate = faker.date.past(1);
	if (faker.random.boolean()) obj.history = fakeSentence(50);
	if (faker.random.boolean()) obj.comments = fakeSentence(50);
	if (faker.random.boolean()) obj.address = fakeAddress();
	if (enabled && faker.random.boolean()) obj.disableDate = faker.date.past(1);
	if (faker.random.boolean() || enabled) obj.lat = Number((32.848439 + ((5000 - rn(10000)) * 0.000005)).toFixed(6));
	if (faker.random.boolean() || enabled) obj.lon = Number((35.117543 + ((5000 - rn(10000)) * 0.000005)).toFixed(6));
	return obj;
};

const randomEvent = (hydrantId, ind) => {
	return {
		hydrantId,
		code: rn({ min: 0, max: 8 }),
		edata: rn({ min: 0, max: 1000 }),
		createdAt: faker.date.past(1),
	};
};

const fillHydrantsAndEvents = (nHydrants, nEvents, sims) => {
	Events.remove({});
	Hydrants.remove({});
	Counts.upsert('HydrantsSerialNumber', { $set: { next_val: nHydrants } });
	console.log('starting');
	const first = (new Date()).getTime();
	console.log(first);

	let a;
	let r;

	a = [];
	for (let i = 0; i < nHydrants; i += 1) {
		a.push(randomHydrant(i, _.get(sims, [i])));
	}
	r = Hydrants.batchInsert(a);

	console.log('hydrants length');
	console.log(r.length);

	if (nEvents) {
		a = [];
		for (let i = 0; i < r.length; i += 1) {
			for (let j = 0; j < nEvents; j += 1) {
				a.push(randomEvent(r[i], (i * nEvents) + j));
			}
		}
		r = Events.batchInsert(a);
	}

	console.log('eevents length');
	console.log(r.length);

	const last = (new Date()).getTime();
	console.log(last);
	console.log('dif');
	console.log(last - first);
};

const fillUsers = () => {
	Meteor.users.remove({});
	const data = [
		{
			email: 'a@a.a',
			password: 'aaaaaa',
			profile: {
				name: {
					first: 'משה',
					last: 'בן-משה',
				},
			},
			role: 0,
			companyId: Companies.find({}).fetch()[0]._id,
		},
		{
			email: 'user1@a.a',
			password: 'aaaaaa',
			profile: {
				name: {
					first: 'משתמש 1',
					last: 'שם משתמש 1',
				},
			},
			companyId: Companies.find({}).fetch()[0]._id,
			role: 0,
		},
		{
			email: 'user2@a.a',
			password: 'aaaaaa',
			profile: {
				name: {
					first: 'משתמש 2',
					last: 'שם משתמש 2',
				},
			},
			companyId: Companies.find({}).fetch()[1]._id,
			role: 1,
		},
		{
			email: 'user3@a.a',
			password: 'aaaaaa',
			profile: {
				name: {
					first: 'משתמש 3',
					last: 'שם משתמש 3',
				},
			},
			companyId: Companies.find({}).fetch()[2]._id,
			role: 2,
		},
	];
	for (let i = 0; i < data.length; i += 1) {
		Meteor.users.update(Accounts.createUser(data[i]), { $set: { companyId: data[i].companyId, role: data[i].role } });
	}
};
const fillCompanies = () => {
	Companies.remove({});
	Counts.upsert('CompaniesSerialNumber', { $set: { next_val: 3 } });
	seeder(Companies, {
		environments: ['development', 'staging'],
		noLimit: true,
		wipe: true,
		data: [
			{
				name: 'עין אפק 1',
				address: fakeAddress(),
				contactPerson: 'יוצר קשר 1'
			},
			{
				name: 'עין אפק 2',
				address: fakeAddress(),
				contactPerson: 'יוצר קשר 2'
			},
			{
				name: 'עין אפק 3',
				address: fakeAddress(),
				contactPerson: 'יוצר קשר 3'
			},
		],
	});
};

function initDb() {
	// fillCompanies();
	// fillUsers();
	fillHydrantsAndEvents(1000, 10);
}
function initAllDb() {
	fillCompanies();
	fillUsers();
	fillHydrantsAndEvents(1000, 10);
}

function resetDb() {
	Events.remove({});
	Hydrants.remove({});
}

function resetAllDb() {
	Counts.remove({});
	Static.remove({});
	Static.insert({});
	Events.remove({});
	Hydrants.remove({});
	Devices.remove({});
	Messages.remove({});
	Errors.remove({});
	Meteor.users.remove({});
}


function initTestDb() {
	Events.remove({});
	Hydrants.remove({});
	// Counts.remove({});
	Counts.upsert('HydrantsSerialNumber', { $set: { next_val: 3 } });
	// Counts.upsert('CompaniesSerialNumber', { $set: { next_val: 3 } });
	// fillCompanies();
	// fillUsers();
	const sims = [111, 222, 333];
	fillHydrantsAndEvents(3, 0, sims);
}

// resetAllDb();
// initAllDb();
// fillHydrantsAndEvents(1000, 10);

export { initTestDb, initDb, resetDb };

// fillUsers();

// initDb();

// Counts.remove({});
// fillHydrantsAndEvents(1000, 10);
// fillCompanies();

// initSmallDb();

// Counts.upsert('EventsSerialNumber', { $set: { next_val: 10 } });

// fillUsers();
// initDb();

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
