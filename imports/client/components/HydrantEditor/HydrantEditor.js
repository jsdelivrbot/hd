/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

class HydrantEditor extends React.Component {
	componentDidMount() {
		const component = this;
		validate(component.form, {
			rules: {
				sim: {
					required: true,
					maxlength: 24,
				},
				lat: {
					required: false,
				},
				lon: {
					required: false,
				},
				status: {
					required: false,
				},
				lastComm: {
					required: false,
				},
				address: {
					required: false,
					maxlength: 50,
				},
				description: {
					required: false,
					maxlength: 50,
				},
				enabled: {
					required: false,
				},
			},
			messages: {
				number: {
					maxlength: 'אורך מקסימלי 8',
				},
				sim: {
					required: 'נא לציין מספר סים',
					maxlength: 'אורך מקסימלי 24',
				},
				address: {
					maxlength: 'אורך מקסימלי 50',
				},
				description: {
					maxlength: 'אורך מקסימלי 50',
				},
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	handleSubmit() {
		const { history } = this.props;
		const existingHydrant = this.props.doc && this.props.doc._id;
		const methodToCall = existingHydrant ? 'hydrants.update' : 'hydrants.insert';
		const doc = {
			sim: this.sim.value,
			lat: this.lat.value,
			lon: this.lon.value,
			status: this.status.value,
			lastComm: this.lastComm.value,
			address: this.address.value,
			description: this.description.value,
			enabled: this.enabled.checked,
		};
		console.log(`isenabled: ${this.enabled.checked}`);

		if (existingHydrant) doc._id = existingHydrant;
		console.log('inserting');

		Meteor.call(methodToCall, doc, (error, hydrantId) => {
			console.log('here');
			if (error) {
				console.log('here');
				Bert.alert(error.reason, 'danger');
			} else {
				console.log('here');
				const confirmation = existingHydrant ? ' התעדכן הידרנט! ' : ' נוסף הידרנט! ';
				this.form.reset();
				Bert.alert(confirmation, 'success');
				history.push(`/hydrants/${hydrantId}`);
			}
		});
	}

	render() {
		const { doc } = this.props;
		return (<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
			<FormGroup className="has-warning">
				<ControlLabel>מספר סים</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="sim"
					ref={sim => (this.sim = sim)}
					defaultValue={doc && doc.sim}
					placeholder="חובה"
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>קו רוחב</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="lat"
					ref={lat => (this.lat = lat)}
					defaultValue={doc && doc.lat}
					placeholder=""
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>קו אורך</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="lon"
					ref={lon => (this.lon = lon)}
					defaultValue={doc && doc.lon}
					placeholder=""
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>סטטוס</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="status"
					ref={status => (this.status = status)}
					defaultValue={doc && doc.status}
					placeholder=""
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>תקשורת אחרונה</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="lastComm"
					ref={lastComm => (this.lastComm = lastComm)}
					defaultValue={doc && doc.lastComm}
					placeholder=""
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>כתובת</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="address"
					ref={address => (this.address = address)}
					defaultValue={doc && doc.address}
					placeholder=""
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>תאור</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="description"
					ref={description => (this.description = description)}
					defaultValue={doc && doc.description}
					placeholder=""
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>מאופשר</ControlLabel>
				<input
					type="checkbox"
					className="form-control"
					name="enabled"
					ref={enabled => (this.enabled = enabled)}
					defaultChecked={(doc && doc.enabled) ? 'checked' : ''}
				/>
			</FormGroup>
			<Button type="submit" bsStyle="success">
				{doc && doc._id ? 'לשמור שינויים' : 'להוסיף הידרנט'}
			</Button>
		</form>);
	}
}

HydrantEditor.defaultProps = {
	doc: { title: '', body: '' },
};

HydrantEditor.propTypes = {
	doc: PropTypes.object,
	history: PropTypes.object.isRequired,
};

export default HydrantEditor;
