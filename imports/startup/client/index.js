import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import App from '../../client/Main/App/App';

import '../../client/stylesheets/app.scss';

// Raven.config('https://61d91ce1100c4f3696b5a196179a35d7@sentry.io/249201').install();

Meteor.startup(() => render(<App />, document.getElementById('react-root')));
