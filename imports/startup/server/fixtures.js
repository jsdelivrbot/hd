import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import seeder from './seeder';
import Hydrants from '../../api/Hydrants/Hydrants';
import Events from '../../api/Events/Events';
import {words} from './local/he';

const eventsSeed = hydrantId => ({
	collection: Events,
	environments: ['development', 'staging'],
	noLimit: true,
	wipe: false,
	modelCount: 5,
	model(index, faker) {
		console.log(hydrantId);
		return {
			hydrantId,
			code: faker.random.number({ min: 0, max: 10 }),
			edata: faker.random.number(),
			createdAt: faker.date.past(2, '2010-01-01'),
		};
	},
});

export default function initDb() {
	seeder(Hydrants, {
		environments: ['development', 'staging'],
		noLimit: true,
		wipe: true,
		modelCount: 3,
		model(index, faker) {
			console.log('first model');
			return {
				companyId: 1,
				sim: faker.random.number(),
				lat: faker.address.latitude(),
				lon: faker.address.longitude(),
				status: faker.random.number(10),
				lastComm: (new Date()).toISOString(),
				address: faker.address.streetAddress('##'),
				description: faker.lorem.sentence(5),
				enabled: faker.random.boolean(),
				data(_id) {
					return eventsSeed(_id);
				},
			};
		},
	});

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

initDb();
