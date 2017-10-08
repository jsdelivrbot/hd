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
	withStateHandlers,
	mapProps,
} from 'recompose';
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	Marker,
	InfoWindow,
} from 'react-google-maps';
import withLog from '@hocs/with-log';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import { Label, Segment } from 'semantic-ui-react';
import _ from 'lodash';

import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';
import SubManager from '../../../api/Utility/client/SubManager';
import { getHydrantFindFilter } from '../../Storage/Storage';

import './Css/Map.scss';

const NotFound = () => (<Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>);

const Map = compose(
	meteorData(() => {
		const subscription = SubManager.subscribe('hydrants');
		const filter = getHydrantFindFilter(['date', 'status', 'id']);
		const dataH = HydrantsCollection.find(filter).fetch();
		return {
			loading: !subscription.ready(),
			nodata: !dataH.length,
			dataH,
		};
	}),
	branch(p => p.loading, renderComponent(Loading)),
	branch(p => p.nodata, renderComponent(NotFound)),
	mapProps(({ dataH, ...p }) => ({
		dataH,
		totalUnits: dataH.length,
		...p,
	})),
	withProps({
		googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&language=iw&region=il&key=AIzaSyBLZ9MQsAOpEzHcubQCo-fsKhb1EoUt88U&libraries=geometry,drawing,places',
		loadingElement: <div style={{ height: '100%' }} />,
		containerElement: <div style={{ height: '600px' }} />,
		mapElement: <div style={{ height: '100%', width: '1140px' }} />,
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
	withStateHandlers(() => ({
		infoWindowsId: undefined,
	}), {
		onClickMarker: () => id => ({
			infoWindowsId: id,
		}),
	}),
	withLog((p) => { console.log(p); return ''; }),
	setDisplayName('Map'),
)(
	(p) => {
		const currentDate = (new Date()).toLocaleString('he-IL').split(',')[0];
		return (
			<div className="Map">
				<GoogleMap
					defaultCenter={{ lat: 32.848439, lng: 35.117543 }}
					zoom={p.zoom}
					ref={p.onMapMounted}
					onZoomChanged={p.onZoomChanged}
				>
					<MarkerClusterer
						averageCenter
						enableRetinaIcons
						gridSize={60}
					>
						{p.dataH.map((d) => {
							let icon, color, eventType;
							if (d.status) {
								icon = 'marker_blue.ico';
								color = '#0000ff';
								eventType = 'פעיל';
							} else {
								icon = 'marker_red.ico';
								color = '#ff0000';
								eventType = 'מושבת';
							}
							return (
								<Marker
									icon={icon}
									key={d._id}
									position={{ lat: d.lat, lng: d.lon }}
									onClick={() => p.onClickMarker(d._id)}
								>
									{p.infoWindowsId === d._id &&
										<InfoWindow onCloseClick={p.onClickMarker}>
											<Label size="big" style={{ color, backgroundColor: '#ffffff' }} >
												כתובת ההידרנט:<br />
												{d.address}<br />
												מס&quot;ד הידרנט: {d.number}<br />
												סוג האירוע: {eventType}
											</Label>
										</InfoWindow>
									}
								</Marker>
							);
						})}
					</MarkerClusterer>
				</GoogleMap>
				<Segment raised textAlign="center" size="big">
					סה&quot;כ מוצרים מותקנים על הידרנטים ברחבי תאגיד עין אפק:  {p.totalUnits} יח&#39;<br />
					נכון לתאריך: {currentDate}
				</Segment>
			</div>
		);
	}
);

const wrap = () => (
	<div>
		<div style={{ height: 20 }} />
		<Map />
	</div>
);

export default wrap;
