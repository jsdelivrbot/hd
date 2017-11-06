import React from 'react';
import { Meteor } from 'meteor/meteor';
import {
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
} from 'recompose';

import Loading from '../../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';
import HydrantEditor from '../../Hydrants/HydrantEditor/HydrantEditor';

import {
	getStore as getStoreHydrantsPage,
	setStore as setStoreHydrantsPage,
} from '../../../Storage/Storage';

const getStore = keys => getStoreHydrantsPage('hydrantPage', keys);
const setStore = obj => setStoreHydrantsPage('hydrantsPage', obj);

export default compose(
	withStateHandlers(
		() => ({
			data: undefined,
			loading: false,
			initialized: false,
		}), {
			setLoading: () => loading => ({ loading }),
			setData: () => data => ({ data }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			console.log('initializing');

			p.setLoading(true);
			let types = getStore('types');
			if (!types) types = setStore('types', await Meteor.callPromise('get.types'));
			const id = p.match.params._id;
			if (id) p.setData(await Meteor.callPromise('hydrants.get.data.one', { filter: { _id: id } }));
			p.setLoading(false);

			p.setInitialized(true);
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering');
		return (
			<div className="EditHydrant">
				<h4 className="page-header">{` עריכת הידרנט מספר ${p.data.number} `}</h4>
				<HydrantEditor {...p} />
			</div>
		);
	});
