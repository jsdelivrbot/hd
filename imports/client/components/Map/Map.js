
import React from 'react';
import _ from 'lodash';
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

const MapItself = compose(
	withStateHandlers(
		p => ({
			onDrugEnd: false,
			zoom: p._id ? 15 : p.getStore('zoom') || 7,
			center: p.getStore('center'),
			// center: p.getStore('center') || { lat: 32.848439, lng: 35.117543 },
			data: p.getStore('data') || [],
			initialized: false,
			dataInitialized: false,
			mapRef: undefined,
			bounds: {},
		}), {
			setOnDrugStart: () => () => ({ onDrugEnd: false }),
			setOnDrugEnd: () => () => ({ onDrugEnd: true }),
			setMapRef: () => mapRef => ({ mapRef }),
			setZoom: ({ mapRef }, p) => () => p.setStore({ zoom: mapRef.getZoom() }),
			setCenter: ({ mapRef }, p) => () => p.setStore({ center: mapRef.getCenter() }),
			setBounds: ({ mapRef }, p) => () => p.setStore({ bounds: mapRef.getBounds().toJSON() }),
			setData: ({}, p) => data => p.setStore({ data }),
			setInitialized: () => initialized => ({ initialized }),
			setDataInitialized: () => dataInitialized => ({ dataInitialized }),
		}
	),
	withHandlers(() => ({
		onTilesLoaded: ({ mapRef, initialized, setBounds, setInitialized }) => () => {
			if (!initialized) {
				// console.log(mapRef.getCenter().lng());
				setBounds();
				setInitialized(true);
			}
		},
		getPixelPositionOffset: () => (width, height) => ({
			x: -(width / 2),
			y: -(height / 2),
		})
	})),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			this.storeEmpty = false;
			this.savedBounds = p.getStore('bounds');
			if (!p.getStore()) {
				p.setLoading(true);
				const { cntTroubledUnits, cntAllUnits } = await Meteor.callPromise('map.get.counts');
				p.setLoading(false);
				p.setCntTroubledUnits(cntTroubledUnits);
				p.setCntAllUnits(cntAllUnits);
				this.storeEmpty = true;
				setTimeout(() => p.setAllLoaded(true), 2000);
			} else {
				setTimeout(() => p.setAllLoaded(true), 1000);
			}
			p.setDataInitialized(true);
		},
		async componentWillReceiveProps(p) {
			if (!p.initialized) return;
			const mp = difProps({ prevProps: this.props, nextProps: p });
			_.forEach(mp, (v, k) => console.log(k, p[k]));
			if (p.loading) return;
			
			let data = p.data;
			if ((mp.onDrugEnd && p.onDrugEnd) || mp.filterStatus || this.storeEmpty || p.getStore('refresh')) {
				p.setStore({ refresh: false });
				console.log('map loading data');
				this.storeEmpty = false;
				p.setLoading(true);
				if (p._id) {
					data = await Meteor.callPromise('map.get.data.one', { _id: p._id });
				} else {
					data = await Meteor.callPromise('map.get.data', {
						filterStatus: p.filterStatus,
						bounds: p.bounds,
						_id: p._id,
					});
				}
				p.setData(data);

				if (data.length) {
					
					if (mp.filterStatus) {
						if (p.filterStatus) {
							const { south, north, west, east } = p.cntTroubledUnits;
							p.mapRef.fitBounds({ south, north, west, east });
						} else {
							const { south, north, west, east } = p.cntAllUnits;
							p.mapRef.fitBounds({ south, north, west, east });
						}
					}
					if (!this.firstSet) {
						console.log(data);
						if (!p._id && this.savedBounds) {
							p.mapRef.panTo(p.center);
						} else {
							const { south, north, west, east } = p.cntAllUnits;
							p.mapRef.fitBounds({ south, north, west, east });
						}
						if (p._id) {
							p.mapRef.panTo({ lat: Number(data[0].lat),	 lng: Number(data[0].lon) });
						}
						this.firstSet = true;
					}
				}
				
				p.setLoading(false);
			}
		},

	}),
	branch(p => !p.dataInitialized, renderComponent(Loading)),
	withProps(p => ({
		googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&language=iw&region=il&key=AIzaSyBLZ9MQsAOpEzHcubQCo-fsKhb1EoUt88U&libraries=geometry,drawing,places',
		loadingElement: <div style={{ height: '100%' }} />,
		containerElement: <div style={{ visibility: p.allLoaded ? 'visible' : 'hidden', marginTop: '5px', height: '630px' }} />,
		mapElement: <div style={{ height: '100%' }} />,
	})),
	withScriptjs,
	withGoogleMap,
	withStateHandlers(() => ({
		infoWindowsId: undefined,
	}), {
		onClickMarker: () => _id => ({
			infoWindowsId: _id,
		}),
	}),
)(p => (
	<div className="Map" style={{ width: '1140px' }}>
		<GoogleMap
			// defaultCenter={{ lat: 32.848439, lng: 35.117543 }}
			center={p.center || { lat: 32.848439, lng: 35.117543 }}
			zoom={p.zoom}
			// bounds={p.bounds}
			ref={p.setMapRef}
			onBoundsChanged={p.setBounds}
			onCenterChanged={p.setCenter}
			onZoomChanged={p.setZoom}
			onTilesLoaded={p.onTilesLoaded}
			onDragEnd={p.setOnDrugEnd}
			onDragStart={p.setOnDrugStart}
		>
			<MarkerClusterer
				averageCenter
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
	</div>
));

export default compose(
	withHandlers({
		getStore: p => keys => (p._id ? undefined : getStore(`map_${p.company._id}_${p._id}`, keys)),
		setStore: p => obj => setStore(`map_${p.company._id}_${p._id}`, obj),
	}),
	withStateHandlers(
		p => ({
			filterStatus: p.getStore('filterStatus'),
			allLoaded: false,
			loading: false,
			cntAllUnits: p.getStore('cntAllUnits') || 0,
			cntTroubledUnits: p.getStore('cntTroubledUnits') || 0,
		}), {
			toggleFilterStatus: ({ filterStatus }, p) => () => p.setStore({ filterStatus: !filterStatus }),
			setCntAllUnits: ({}, p) => cntAllUnits => p.setStore({ cntAllUnits }),
			setCntTroubledUnits: ({}, p) => cntTroubledUnits => p.setStore({ cntTroubledUnits }),
			setAllLoaded: ({}, p) => allLoaded => p.setStore({ allLoaded }),
			setLoading: ({}, p) => loading => p.setStore({ loading }),
		}
	)
)((p) => {
	console.log('rendering map');

	const currentDate = (new Date()).toLocaleString('he-IL').split(',')[0];
	console.log('p.allLoaded');
	console.log(p.allLoaded);
	return (
		<div>
			<Loader show={p.loading || !p.allLoaded} message={Loading()} backgroundStyle={{ backgroundColor: 'transparent' }}>
				<div style={{ minHeight: '600px', width: '1140px' }}>
					<If condition={!p._id}>
						<Flex style={{ height: 1 }} align="center">
							<Box w={7 / 8} />
							<Box w={1 / 8}>
								<Button
									style={{ zIndex: 10000, position: 'relative', left: 120, top: 32 }}
									bsStyle={!p.filterStatus ? 'default' : 'danger'}
									block
									onClick={() => p.toggleFilterStatus()}
								>
									{!p.filterStatus ? 'כולם' : 'בארוע'}
								</Button>
							</Box>
						</Flex>
					</If>
					<MapItself {...p} />
					<Choose>
						<When condition={!p._id}>
							<Segment style={{ marginBottom: 50 }} raised textAlign="center" size="big">
								<Flex align="center">
									<Box w={1}>
										<span>
											סה&quot;כ מוצרים מתוך תאגיד {p.company.name}:  {p.cntAllUnits.sum} יח&#39;<br />
											מתוכם מוצרים בארוע:  {p.cntTroubledUnits.sum} יח&#39;<br />
											נכון לתאריך: {currentDate}
										</span>
									</Box>
								</Flex>
							</Segment>
						</When>
						<Otherwise>
							<div style={{ paddingBottom: 60 }} />
						</Otherwise>
					</Choose>
				</div>
			</Loader>
		</div>
	);
});


// minZoom, cancel zoom and center save, fitbounds, on first load server: calculate bounds, load bounds
// saving issue, check events
// use cursor -> find, use index, large datasets
// show loading
// zoom/pan  while downloading previous one and smooth zoom
// various limits, testing on cloud
