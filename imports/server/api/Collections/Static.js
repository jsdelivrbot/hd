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
			status: {
				0: 'הכל OK',
				1: 'בטריה ריקה',
				2: 'אין תקשורת',
				3: 'התעללות',
				4: 'זרימה רגילה',
				5: 'זרימה הפוכה',
			},
			code: {
				0: 'OK',
				1: 'בטריה ריקה',
				2: 'התעללות',
				3: 'תחילת זרימה רגילה',
				4: 'המשך זרימה רגילה',
				5: 'סיום זרימה רגילה',
				6: 'תחילת זרימה הפוכה',
				7: 'המשך זרימה הפוכה',
				8: 'סיום זרימה הפוכה',
			},
			createdAt: {
				0: 'יממה',
				1: 'שבוע',
				2: 'חודש',
				3: 'רבעון',
				4: 'שנה',
			},
			roles: {
				0: 'אדמין',
				1: 'מוקד',
				2: 'אבטחה',
			}
		},
	},
});

Static.attachSchema(Static.schema);

export default Static;
