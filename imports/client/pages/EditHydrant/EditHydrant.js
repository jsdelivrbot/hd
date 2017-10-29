import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Hydrants from '../../../server/api/Hydrants/Hydrants';
import HydrantEditor from '../../components/HydrantEditor/HydrantEditor';
import NotFound from '../../components/LayoutLoginAndNavigationAndGeneral/NotFound/NotFound';

const EditHydrant = ({ doc, history }) => (doc ? (
	<div className="EditHydrant">
		<h4 className="page-header">{` עריכת הידרנט מספר ${doc.number} `}</h4>
		<HydrantEditor doc={doc} history={history} />
	</div>
) : <NotFound />);

EditHydrant.defaultProps =
	{
		doc: null,
	};

EditHydrant.propTypes = {
	doc: PropTypes.object,
	history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
	const hydrantId = match.params._id;
	const subscription = Meteor.subscribe('hydrants.view', hydrantId);

	return {
		loading: !subscription.ready(),
		doc: Hydrants.findOne(hydrantId),
	};
}, EditHydrant);
