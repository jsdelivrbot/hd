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
				number: {
					required: false,
					maxlength: 8,
				},
				keyId: {
					required: true,
					maxlength: 24,
				},
				companyId: {
					required: false,
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
				keyId: {
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
			number: this.title.value.trim(),
			keyId: this.keyId.value.trim(),
			companyId: this.companyId.value.trim(),
			lat: this.lat.value.trim(),
			lon: this.lon.value.trim(),
			status: this.status.value.trim(),
			lastComm: this.lastComm.value.trim(),
			address: this.address.value.trim(),
			description: this.description.value.trim(),
			enabled: this.enabled.value.trim(),
		};

		if (existingHydrant) doc._id = existingHydrant;

		Meteor.call(methodToCall, doc, (error, hydrantId) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				const confirmation = existingHydrant ? 'Hydrant updated!' : 'Hydrant added!';
				this.form.reset();
				Bert.alert(confirmation, 'success');
				history.push(`/hydrants/${hydrantId}`);
			}
		});
	}

	render() {
		const { doc } = this.props;
		return (<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
			<FormGroup>
				<ControlLabel>מספר הידרנט</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="number"
					ref={number => (this.number = number)}
					defaultValue={doc && doc.number}
					placeholder="12345678"
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>מספר סים</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="keyId"
					ref={keyId => (this.keyId = keyId)}
					defaultValue={doc && doc.keyId}
					placeholder=""
				/>
			</FormGroup>
			<FormGroup>
				<ControlLabel>מספר חברה</ControlLabel>
				<input
					type="text"
					className="form-control"
					name="companyId"
					ref={companyId => (this.companyId = companyId)}
					defaultValue={doc && doc.companyId}
					placeholder=""
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
				<ControlLabel>תאריך תקשורת אחרון</ControlLabel>
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
					type="text"
					className="form-control"
					name="enabled"
					ref={enabled => (this.enabled = enabled)}
					defaultValue={doc && doc.enabled}
					placeholder=""
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
