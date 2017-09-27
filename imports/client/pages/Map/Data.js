import React from 'react';
import { Alert } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { compose, renderComponent, branch, withProps, withState, withHandlers } from 'recompose';
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	Marker,
} from 'react-google-maps';
import Loading from '../../components/Loading/Loading';
import { meteorData } from '../../Utils/utils';
import HydrantsCollection from '../../../api/Hydrants/Hydrants';

const MapWithControlledZoom = compose(
	withProps({
		googleMapURL: 'https://maps.googleapis.com/maps/api/js?v=3.exp&language=iw&region=il&key=AIzaSyBLZ9MQsAOpEzHcubQCo-fsKhb1EoUt88U&libraries=geometry,drawing,places',
		loadingElement: <div style={{ height: '100%' }} />,
		containerElement: <div style={{ height: '400px' }} />,
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
)(props => (
	<GoogleMap
		defaultCenter={{ lat: 32.848439, lng: 35.117543 }}
		zoom={props.zoom}
		ref={props.onMapMounted}
		onZoomChanged={props.onZoomChanged}
	>
		<Marker
			position={{ lat: 32.858439, lng: 35.117543 }}
			onClick={props.onToggleOpen}
		/>
		<Marker
			position={{ lat: 32.848439, lng: 35.117543 }}
			onClick={props.onToggleOpen}
		/>
		<Marker
			position={{ lat: 32.838439, lng: 35.117543 }}
			onClick={props.onToggleOpen}
		/>
	</GoogleMap>
));

const Data = props => (
	<div className="Map">
		<MapWithControlledZoom />
	</div>
);

const NotFound = () => (<Alert bsStyle="warning">עדיין אין הידרנטים!</Alert>);

export default compose(
	meteorData(() => {
		const subscription = Meteor.subscribe('hydrants');
		return {
			loading: !subscription.ready(),
			data: HydrantsCollection.find().fetch(),
		};
	}),
	branch(props => props.loading, renderComponent(Loading)),
	branch(props => !props.data.length, renderComponent(NotFound)),
)(Data);

