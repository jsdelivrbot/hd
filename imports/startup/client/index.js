import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import App from '../../client/layouts/App/App';

import '../../client/stylesheets/app.scss';

Meteor.startup(() => render(<App />, document.getElementById('react-root')));
