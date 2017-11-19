
import { Meteor } from 'meteor/meteor';

const isUserAdmin = () => Meteor.user() && (Meteor.user().role === 0);
const isUserControl = () => Meteor.user() && (Meteor.user().role === 1);
const isUserAdminOrControl = () => Meteor.user() && (Meteor.user().role === 0 || Meteor.user().role === 1);

export { isUserAdmin, isUserControl, isUserAdminOrControl };
