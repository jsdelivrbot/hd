
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

import Loading from '../../components/Loading/Loading';
import { difProps } from '../../Utils/Utils';

import './Css/Map.scss';

import {
	getStore as getStoreHydrantsPage,
	setStore as setStoreHydrantsPage,
} from '../../Storage/Storage';

const getStore = keys => getStoreHydrantsPage('hydrantsPage', keys);
const setStore = obj => setStoreHydrantsPage('hydrantsPage', obj);


const Map1 = compose(
	withProps({
		googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places',
		loadingElement: <div style={{ height: '100%' }} />,
		containerElement: <div style={{ height: '400px' }} />,
		mapElement: <div style={{ height: '100%' }} />,
	}),
	withState('zoom', 'onZoomChange', 8),
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
			}
		};
	}),
	withScriptjs,
	withGoogleMap
)(props =>
	(<GoogleMap
		defaultCenter={{ lat: -34.397, lng: 150.644 }}
		zoom={props.zoom}
		ref={props.onMapMounted}
		onZoomChanged={props.onZoomChanged}
	>
		<Marker
			position={{ lat: -34.397, lng: 150.644 }}
			onClick={props.onToggleOpen}
		>
			<InfoWindow onCloseClick={props.onToggleOpen}>
				<div>
					{' '}
          			Controlled zoom: {props.zoom}
				</div>
			</InfoWindow>
		</Marker>
	</GoogleMap>)
);




const Map = compose(
	withStateHandlers(
		() => ({
			data: getStore('data') || [],
			loading: false,
			initialized: false,
			dataInitialized: false,
			countTotalUnits: getStore('countTotalUnits') || 0,
			mapRef: undefined,
			bounds: {},
		}), {
			setMapRef: () => mapRef => ({ mapRef }),
			setCountActiveUnits: () => countTotalUnits => setStore({ countTotalUnits }),
			setBounds: ({ mapRef }) => () => setStore({ bounds: mapRef.getBounds().toJSON() }),
			setLoading: () => loading => setStore({ loading }),
			setData: () => data => setStore({ data }),
			setInitialized: () => initialized => ({ initialized }),
			setDataInitialized: () => dataInitialized => ({ dataInitialized }),
		}
	),
	withHandlers(() => ({
		onMapMounted: ({ setMapRef }) => (ref) => {
			setMapRef(ref);
		},
		onBoundsChanged: ({ setBounds }) => () => {
			setBounds();
		},
		onTilesLoaded: ({ mapRef, setBounds, setInitialized }) => () => {
			setBounds();
			setInitialized(true);
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
				console.log('loading data');
				this.storeEmpty = false;
				p.setLoading(true);
				p.setData(await Meteor.callPromise('map.get.data', { bounds: p.bounds }));
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
	(p) => {
		const currentDate = (new Date()).toLocaleString('he-IL').split(',')[0];
		return (
			<div className="Map">
				<GoogleMap
					defaultCenter={{ lat: 32.848439, lng: 35.117543 }}
					zoom={13}
					ref={p.onMapMounted}
					onBoundsChanged={p.onBoundsChanged}
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
