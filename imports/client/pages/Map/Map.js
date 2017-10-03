import React from 'react';
import { Alert } from 'react-bootstrap';
import {
	withHandlers,
	withState,
	withProps,
	setDisplayName,
	compose,
	renderComponent,
	branch,
} from 'recompose';
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	Marker,
} from 'react-google-maps';
import withLog from '@hocs/with-log';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import SubManager from '../../../api/Utility/client/SubManager';
import { getSelectedHydrants } from '../../Storage/Storage';

import './Css/Map.scss';

const NotFound = () => (<Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>);

export default compose(
	meteorData(() => {
		const selectedHydrants = getSelectedHydrants();
		console.log(selectedHydrants);
		const subscription = SubManager.subscribe('hydrants');
		const dataH = HydrantsCollection.find({ _id: selectedHydrants }).fetch();
		return {
			loading: !subscription.ready(),
			nodata: !dataH.length,
			dataH,
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	branch(p => p.nodata, renderComponent(NotFound)),
	withProps({
		googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&language=iw&region=il&key=AIzaSyBLZ9MQsAOpEzHcubQCo-fsKhb1EoUt88U&libraries=geometry,drawing,places',
		loadingElement: <div style={{ height: '100%' }} />,
		containerElement: <div style={{ height: '550px' }} />,
		mapElement: <div style={{ height: '100%' }} />,
	}),
	withState('zoom', 'onZoomChange', 13),
	withHandlers(() => {
		const refs = {
			map: undefined,
		};
		return {
			onMapMounted: () => (ref) => {
				refs.map = ref;
			},
			onZoomChanged: ({ onZoomChange }) => () => {
				onZoomChange(refs.map.getZoom());
			},
		};
	}),
	withScriptjs,
	withGoogleMap,
	withLog((p) => { console.log(p); return ''; }),
	setDisplayName('Map'),
)(
	({ dataH, zoom, onMapMounted, onZoomChanged, onToggleOpen }) => (
		<div className="Map">
			<div style={{ height: 40 }} />
			<GoogleMap
				defaultCenter={{ lat: 32.848439, lng: 35.117543 }}
				zoom={zoom}
				ref={onMapMounted}
				onZoomChanged={onZoomChanged}
			>
				<MarkerClusterer
					averageCenter
					enableRetinaIcons
					gridSize={60}
				>
					{ dataH.map(d => (
						<Marker
							icon="marker.ico"
							key={d._id}
							position={{ lat: d.lat, lng: d.lon }}
							onClick={onToggleOpen}
						/>
					))}
				</MarkerClusterer>
			</GoogleMap>
		</div>
	),
);
