import React from 'react';
import { Meteor } from 'meteor/meteor';
import {
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
} from 'recompose';

import Loader from 'react-loader-advanced';
import Loading from '../../../components/LoginLayoutNavigation/Loading/Loading';
import CompanyEditor from '../components/CompanyEditor/CompanyEditor';

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

			p.setLoading(true);
			const _id = p.match.params._id;
			if (_id) p.setData(await Meteor.callPromise('companies.get.data.one', { filter: { _id } }));
			p.setLoading(false);

			p.setInitialized(true);
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(
	(p) => {
		console.log('rendering EditCompany');
		return (
			<div className="EditCompany">
				<h4 className="page-header">{` עריכת חברה מספר ${p.data.number} `}</h4>
				<Loader show={p.loading} message={Loading()} backgroundStyle={{ backgroundColor: 'transparent' }}>
					<CompanyEditor {...p} />
				</Loader>
			</div>
		);
	});
