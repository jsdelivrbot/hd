
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
	withHandlers,
	withProps,
	compose,
	renderComponent,
	branch,
	withStateHandlers,
	lifecycle,
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
import { Flex, Box } from 'reflexbox';
import { Button } from 'react-bootstrap';
import Loader from 'react-loader-advanced';

import Loading from '../LoginLayoutNavigation/Loading/Loading';
import { difProps } from '../../Utils/Utils';

import './Css/Map.scss';

import { getStore, setStore } from '../Storage';

export default compose(
	withHandlers({
		getStore: p => keys => getStore(`map_${p.company._id}_${p._id}`, keys),
		setStore: p => obj => setStore(`map_${p.company._id}_${p._id}`, obj),
	}),
	withStateHandlers(
		p => ({
			filterStatus: p.getStore('filterStatus'),
			zoom: p.getStore('zoom') || 13,
			data: p.getStore('data') || [],
			loading: false,
			initialized: false,
			dataInitialized: false,
			cntAllUnits: p.getStore('cntAllUnits') || 0,
			cntTroubledUnits: p.getStore('cntTroubledUnits') || 0,
			mapRef: undefined,
			bounds: {},
		}), {
			setMapRef: () => mapRef => ({ mapRef }),
			toggleFilterStatus: ({ filterStatus }) => () => ({ filterStatus: !filterStatus }),
			setZoom: ({ mapRef }, p) => () => p.setStore({ zoom: mapRef.getZoom() }),
			setCntAllUnits: ({}, p) => cntAllUnits => p.setStore({ cntAllUnits }),
			setCntTroubledUnits: ({}, p) => cntTroubledUnits => p.setStore({ cntTroubledUnits }),
			setBounds: ({ mapRef }, p) => () => p.setStore({ bounds: mapRef.getBounds().toJSON() }),
			setLoading: ({}, p) => loading => p.setStore({ loading }),
			setData: ({}, p) => data => p.setStore({ data }),
			setInitialized: () => initialized => ({ initialized }),
			setDataInitialized: () => dataInitialized => ({ dataInitialized }),
		}
	),
	withHandlers(() => ({
		onTilesLoaded: ({ initialized, setBounds, setInitialized }) => () => {
			if (!initialized) {
				setBounds();
				setInitialized(true);
			}
		},
	})),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			this.storeEmpty = false;
			if (!p.getStore()) {
				p.setLoading(true);
				const { cntTroubledUnits, cntAllUnits } = await Meteor.callPromise('map.get.counts');
				p.setLoading(false);
				p.setCntTroubledUnits(cntTroubledUnits);
				p.setCntAllUnits(cntAllUnits);
				this.storeEmpty = true;
			}
			p.setDataInitialized(true);
		},
		async componentWillReceiveProps(p) {
			if (!p.initialized) return;
			if (p.loading) return;
			const { bounds, filterStatus } = difProps({ prevProps: this.props, nextProps: p });
			if (bounds || filterStatus || this.storeEmpty) {
				this.storeEmpty = false;
				p.setLoading(true);
				p.setData(await Meteor.callPromise('map.get.data', {
					filterStatus: p.filterStatus,
					bounds: p.bounds,
					_id: p._id,
				}));
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
		onClickMarker: () => _id => ({
			infoWindowsId: _id,
		}),
	}),
)(
	(p) => {
		console.log('rendering map');
		const currentDate = (new Date()).toLocaleString('he-IL').split(',')[0];
		return (
			<div className="Map">
				<Loader show={p.loading} message={Loading()} backgroundStyle={{ backgroundColor: 'transparent' }}>
					<GoogleMap
						defaultCenter={{ lat: 32.848439, lng: 35.117543 }}
						zoom={p.zoom}
						ref={p.setMapRef}
						onBoundsChanged={p.setBounds}
						onZoomChanged={p.setZoom}
						onTilesLoaded={p.onTilesLoaded}
					>
						<MarkerClusterer
							// averageCenter
							enableRetinaIcons
							gridSize={50}
						>
							{p.data.map((d) => {
								const eventType = p.types.status[d.status];
								let icon, color;
								if (d.status <= 2) {
									icon = '/marker_blue.ico';
									color = '#0000ff';
								} else {
									icon = '/marker_red.ico';
									color = '#ff0000';
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
				</Loader>
				<If condition={!p._id}>
					<Segment raised textAlign="center" size="big">
						<Flex align="center">
							<Box w={1 / 8}>
								<Button
									bsStyle={p.filterStatus ? 'danger' : 'default'}
									block
									onClick={p.toggleFilterStatus}
								>
									{p.filterStatus ? 'בארוע' : 'כולם'}
								</Button>
							</Box>
							<Box w={6 / 8}>
								<span>
									סה&quot;כ מוצרים מתוך תאגיד {p.company.name}:  {p.cntAllUnits} יח&#39;<br />
									מתוכם מוצרים בארוע:  {p.cntTroubledUnits} יח&#39;<br />
									נכון לתאריך: {currentDate}
								</span>
							</Box>
							<Box w={1 / 8} />
						</Flex>
					</Segment>
				</If>
			</div>
		);
	}
);

// minZoom, cancel zoom and center save, fitbounds, on first load server: calculate bounds, load bounds
// saving issue, check events
// use cursor -> find, use index, large datasets
// show loading
// zoom/pan  while downloading previous one and smooth zoom
// various limits, testing on cloud
