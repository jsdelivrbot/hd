import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import seeder from './seeder';
import Hydrants from '../../api/Hydrants/server/Hydrants';
import Static from '../../api/Utility/Static';
import Events from '../../api/Events/server/Events';
import { words, streets, cities } from './local/he';
import faker from 'faker';

const rn = n => faker.random.number(n);

const eventsSeed = hydrantId => ({
	collection: Events,
	environments: ['development', 'staging'],
	noLimit: true,
	wipe: false,
	modelCount: 3,
	model() {
		return {
			hydrantId,
			code: rn(7),
			edata: faker.random.number(),
			createdAt: faker.date.past(1).toISOString(),
		};
	},
});

export default function initDb() {
	Static.remove({});
	Static.insert({});
	Events.remove({});
	seeder(Hydrants, {
		environments: ['development', 'staging'],
		noLimit: true,
		wipe: true,
		modelCount: 1000,
		model() {
			let sentence = '';
			for (let i = 0; i <= rn({ min: 5, max: 10 }); i += 1) {
				const temp = `${sentence} ${words[rn(words.length)]}`;
				if (temp.length > 50) break;
				else sentence = temp;
			}
			return {
				companyId: 1,
				sim: rn(999999999),
				lat: (32.848439 + ((5000 - rn(10000)) * 0.000005)).toFixed(6),
				lon: (35.117543 + ((5000 - rn(10000)) * 0.000005)).toFixed(6),
				status: rn(1),
				createdAt: faker.date.past(1).toISOString(),
				address: `${cities[rn(cities.length - 1)]} ${streets[rn(streets.length - 1)]} ${rn(99)}`,
				description: sentence,
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
