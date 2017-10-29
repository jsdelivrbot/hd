
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Alert } from 'react-bootstrap';
import {
	withHandlers,
	withProps,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
	withState,
} from 'recompose';
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	Marker,
	InfoWindow,
} from 'react-google-maps';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import { Label, Segment } from 'semantic-ui-react';
import _ from 'lodash';

import Loading from '../../LayoutLoginAndNavigationAndGeneral/Loading/Loading';
import { difProps } from '../../Utils/Utils';

import './Css/Map.scss';

import {
	getStore as getStoreHydrantsPage,
	setStore as setStoreHydrantsPage,
} from '../../Storage/Storage';

const getStore = keys => getStoreHydrantsPage('hydrantsPage', keys);
const setStore = obj => setStoreHydrantsPage('hydrantsPage', obj);

const Map = compose(
	withStateHandlers(
		() => ({
			zoom: getStore('zoom') || 13,
			data: getStore('data') || [],
			loading: false,
			initialized: false,
			dataInitialized: false,
			countTotalUnits: getStore('countTotalUnits') || 0,
			mapRef: undefined,
			bounds: {},
		}), {
			setMapRef: () => mapRef => ({ mapRef }),
			setZoom: ({ mapRef }) => () => setStore({ zoom: mapRef.getZoom() }),
			setCountActiveUnits: () => countTotalUnits => setStore({ countTotalUnits }),
			setBounds: ({ mapRef }) => () => setStore({ bounds: mapRef.getBounds().toJSON() }),
			setLoading: () => loading => setStore({ loading }),
			setData: () => data => setStore({ data }),
			setInitialized: () => initialized => ({ initialized }),
			setDataInitialized: () => dataInitialized => ({ dataInitialized }),
		}
	),
	withHandlers(() => ({
		onTilesLoaded: ({ initialized, setBounds, setInitialized }) => () => {
			console.log('tiles');
			if (!initialized) {
				setBounds();
				setInitialized(true);
			}
		},
	})),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			console.log('initializing data');
			this.storeEmpty = false;
			if (!getStore()) {
				p.setLoading(true);
				p.setCountActiveUnits(await Meteor.callPromise('map.get.init'));
				p.setLoading(false);
				this.storeEmpty = true;
			}
			p.setDataInitialized(true);
		},
		async componentWillReceiveProps(p) {
			if (!p.initialized) return;
			if (p.loading) return;
			const { bounds } = difProps({ prevProps: this.props, nextProps: p });
			if (bounds || this.storeEmpty) {
				console.log('bounds');
				console.log(bounds);
				console.log('loading data');
				this.storeEmpty = false;
				p.setLoading(true);
				p.setData(await Meteor.callPromise('map.get.data', { bounds: p.bounds }));
				console.log('received data');
				p.setLoading(false);
			}
		},

	}),
	branch(p => !p.dataInitialized, renderComponent(Loading)),
	withProps({
		googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&language=iw&region=il&key=AIzaSyBLZ9MQsAOpEzHcubQCo-fsKhb1EoUt88U&libraries=geometry,drawing,places',
		loadingElement: <div style={{ height: '100%' }} />,
		containerElement: <div style={{ marginTop: '20px', height: '600px' }} />,
		mapElement: <div style={{ height: '100%', width: '1140px' }} />,
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
)(
	// minZoom, cancel zoom and center save, fitbounds, on first load server: calculate bounds, load bounds
	// saving issue, check events
	// use cursor -> find, use index, large datasets
	// show loading
	// zoom/pan  while downloading previous one and smooth zoom
	// various limits, testing on cloud
	(p) => {
		console.log('rendering');
		console.log(p.data);
		const currentDate = (new Date()).toLocaleString('he-IL').split(',')[0];
		return (
			<div className="Map">
				<GoogleMap
					defaultCenter={{ lat: 32.848439, lng: 35.117543 }}
					zoom={p.zoom}
					ref={p.setMapRef}
					onBoundsChanged={p.setBounds}
					onZoomChanged={p.setZoom}
					onTilesLoaded={p.onTilesLoaded}
				>
					<MarkerClusterer
						averageCenter
						enableRetinaIcons
						gridSize={60}
					>
						{p.data.map((d) => {
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
					סה&quot;כ מוצרים מתוך תאגיד עין אפק:  {p.countTotalUnits} יח&#39;<br />
					נכון לתאריך: {currentDate}
				</Segment>
			</div>
		);
	}
);

export default Map;
