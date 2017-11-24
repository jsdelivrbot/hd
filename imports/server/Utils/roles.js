
import { Meteor } from 'meteor/meteor';

const isUserAdmin = () => Meteor.userId() && (Meteor.user().role == 0);
const isUserControl = () => Meteor.userId() && (Meteor.user().role == 1);
const isUserAdminOrControl = () => Meteor.userId() && (Meteor.user().role == 0 || Meteor.user().role == 1);
const isUserAdminOrControlOrSecurity = () => Meteor.userId() && (Meteor.user().role == 0 || Meteor.user().role == 1 || Meteor.user().role == 2);

export { isUserAdmin, isUserControl, isUserAdminOrControl, isUserAdminOrControlOrSecurity };
