/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Static = new Mongo.Collection('Static');

Static.allow({
	insert: () => false,
	update: () => false,
	remove: () => false,
});

Static.deny({
	insert: () => true,
	update: () => true,
	remove: () => true,
});

Static.schema = new SimpleSchema({
	types: {
		type: Object,
		blackbox: true,
		label: 'strings',
		defaultValue: {
			code: {
				0: 'OK',
				1: 'בטריה ריקה',
				2: 'התעללות',
				3: 'תחילת זרימה רגילה',
				4: 'המשך זרימה רגילה',
				5: 'סיום זרימה רגילה',
				6: 'תחילת זרימה הפוכה',
				7: 'סיום זרימה הפוכה',
			},
			createdAt: {
				0: 'יממה',
				1: 'שבוע',
				2: 'חודש',
				3: 'רבעון',
				4: 'שנה',
			},
		},
	},
});

Static.attachSchema(Static.schema);

export default Static;
