import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import faker from 'faker';
import moment from 'moment';
import seeder from './seeder';
import Hydrants from '../../server/api/Collections/Hydrants';
import Companies from '../../server/api/Collections/Companies';
import Static from '../../server/api/Collections/Static';
import Events from '../../server/api/Collections/Events';
import { words, streets, cities } from './local/he';

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
	const enabled = faker.random.boolean();
	const companies = Companies.find({}).fetch();
	return {
		companyId: companies[rn(companies.length - 1)]._id,
		sim: rn(999999999).toString(),
		lat: Number((32.848439 + ((5000 - rn(10000)) * 0.000005)).toFixed(6)),
		lon: Number((35.117543 + ((5000 - rn(10000)) * 0.000005)).toFixed(6)),
		status: rn(5),
		updatedAt: dt,
		createdAt: dt,
		lastComm: faker.date.past(1).toISOString(),
		enabled,
		disableDate: enabled ? faker.date.past(1).toISOString() : '', // moment({ year: 1900 }).toISOString(),
		address: fakeAddress(),
		description: fakeSentence(50),
		disableText: fakeSentence(100),
		number: ind.toString(),
		bodyBarcode: rn(999999999).toString(),
		batchDate: faker.date.past(1).toISOString(),
		history: fakeSentence(50),
		comments: fakeSentence(50),
	};
};

const randomEvent = (hydrantId, ind) => {
	return {
		hydrantId,
		code: rn(7),
		edata: faker.random.number(),
		createdAt: faker.date.past(1).toISOString(),
	};
};

const fillHydrantsAndEvents = () => {
	console.log('starting');
	const first = (new Date()).getTime();
	console.log(first);

	let a;
	let r;

	a = [];
	for (let i = 0; i < 1000; i += 1) {
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
	Events.remove({});
	Hydrants.remove({});
	Counts.upsert('HydrantsSerialNumber', { $set: { next_val: 10000 } });
	Counts.upsert('EventsSerialNumber', { $set: { next_val: 10 } });
	// Counts.upsert('CompaniesSerialNumber', { $set: { next_val: 3 } });
	// fillCompanies();
	// fillUsers();
	fillHydrantsAndEvents();
}

function resetDb() {
	Static.remove({});
	Static.insert({});

	Counts.upsert('CompaniesSerialNumber', { $set: { next_val: 3 } });

	Events.remove({});
	Hydrants.remove({});
	Counts.upsert('HydrantsSerialNumber', { $set: { next_val: 10000 } });
}

export { initDb, resetDb };


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
