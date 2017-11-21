import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import 'moment/locale/he';

import App from '../../client/Main/App/App';

import '../../client/stylesheets/app.scss';

moment.locale('he');

Meteor.startup(() => render(<App />, document.getElementById('react-root')));
