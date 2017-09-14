/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Hydrants = new Mongo.Collection('Hydrants');

Hydrants.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Hydrants.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Hydrants.schema = new SimpleSchema({
  createdAt: {
    type: String,
    label: 'The date this document was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this document was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },
  number: {
    type: String,
    label: 'Unique hydrant serial number.',
    max: 8,
  },
  keyId: {
    type: String,
    label: 'Unique sim ID number.',
    max: 24,
  },
  companyId: {
    type: Number,
    label: 'Company ID',
  },
  lat: {
    type: Number,
    label: 'Latitude',
  },
  lon: {
    type: Number,
    label: 'Longitude',
  },
  status: {
    type: Number,
    label: 'Status',
  },
  lastComm: {
    type: String,
    label: 'Last communication date',
  },
  address: {
    type: String,
    label: 'Address',
    max: 50,
  },
  description: {
    type: String,
    label: 'Description',
    max: 50,
  },
  enabled: {
    type: Boolean,
    label: 'Enabled',
  },
});

Hydrants.attachSchema(Hydrants.schema);

export default Hydrants;
