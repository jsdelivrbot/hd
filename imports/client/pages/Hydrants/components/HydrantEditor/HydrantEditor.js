
import React from 'react';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Flex, Box } from 'reflexbox'
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../../../modules/validate';

class HydrantEditor extends React.Component {
	componentDidMount() {
		const component = this;
		validate(this.form, {
			rules: {
				sim: { required: true, maxlength: 24 },
				bodyBarcode: { required: true, maxlength: 25 },
				disableText: { maxlength: 250 },
				address: { maxlength: 50 },
				description: { maxlength: 50 },
				history: { maxlength: 50 },
				comments: { maxlength: 50 },
			},
			messages: {
				number: { maxlength: 'אורך מקסימלי 8' },
				sim: { required: 'נא לציין מספר סים', maxlength: 'אורך מקסימלי 24' },
				disableText: { maxlength: 'אורך מקסימלי 250' },
				address: { maxlength: 'אורך מקסימלי 50' },
				description: { maxlength: 'אורך מקסימלי 50' },
				history: { maxlength: 'אורך מקסימלי 50' },
				comments: { maxlength: 'אורך מקסימלי 50' },
				bodyBarcode: { required: 'נא לציין ברקוד', maxlength: 'אורך מקסימלי 25' },
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	handleSubmit() {
		const { history } = this.props;
		const existingHydrant = this.props.data && this.props.data._id;
		const methodToCall = existingHydrant ? 'hydrants.update' : 'hydrants.insert';
		const data = {
			sim: this.sim.value,
			lat: this.lat.value,
			lon: this.lon.value,
			status: this.status.value,
			disableDate: this.disableDate.value,
			disableText: this.disableText.value,
			lastComm: this.lastComm.value,
			address: this.address.value,
			description: this.description.value,
			enabled: this.enabled.checked,
			bodyBarcode: this.bodyBarcode.checked,
			batchDate: this.batchDate.checked,
			history: this.history.checked,
			comments: this.comments.checked,
		};

		if (existingHydrant) data._id = existingHydrant;

		Meteor.call(methodToCall, data, (error, hydrantId) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				const confirmation = existingHydrant ? '&emsp; התעדכן הידרנט! ' : '&emsp; נוסף הידרנט! ';
				this.form.reset();
				Bert.alert(confirmation, 'success', 'growl-top-left');
				history.push(`/hydrants/${hydrantId}`);
			}
		});
	}

	render() {
		const { data } = this.props;
		return (
			<Flex align="center">
				<Box w={1 / 5}>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						<FormGroup>
							<ControlLabel>מספר חברה</ControlLabel>
							<input
								type="number"
								className="form-control"
								name="companyId"
								ref={companyId => (this.companyId = companyId)}
								defaultValue={data && data.companyId}
								placeholder=""
							/>
						</FormGroup>
						<FormGroup className="has-warning">
							<ControlLabel>מספר סים</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="sim"
								ref={sim => (this.sim = sim)}
								defaultValue={data && data.sim}
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
								defaultValue={data && data.lat}
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
								defaultValue={data && data.lon}
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
								defaultValue={data && data.status}
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
								defaultValue={data && data.lastComm}
								placeholder=""
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>תאריך ההשבתה</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="disableDate"
								ref={disableDate => (this.disableDate = disableDate)}
								defaultValue={data && data.disableDate}
								placeholder=""
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>תאור ההשבתה</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="disableText"
								ref={disableText => (this.disableText = disableText)}
								defaultValue={data && data.disableText}
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
								defaultValue={data && data.address}
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
								defaultValue={data && data.description}
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
								defaultChecked={(data && data.enabled) ? 'checked' : ''}
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>הערות</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="comments"
								ref={comments => (this.comments = comments)}
								defaultValue={data && data.comments}
								placeholder=""
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>היסטוריה</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="history"
								ref={history => (this.history = history)}
								defaultValue={data && data.history}
								placeholder=""
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>תאריך סדרה</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="batchDate"
								ref={batchDate => (this.batchDate = batchDate)}
								defaultValue={data && data.batchDate}
								placeholder=""
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>ברקוד</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="bodyBarcode"
								ref={bodyBarcode => (this.bodyBarcode = bodyBarcode)}
								defaultValue={data && data.bodyBarcode}
								placeholder=""
							/>
						</FormGroup>
						<Button type="submit" bsStyle="success">
							{data && data._id ? 'לשמור שינויים' : 'להוסיף הידרנט'}
						</Button>
					</form>
				</Box>
				<Box w={2 / 5} />
				<Box w={2 / 5} />
			</Flex>
		);
	}
}

export default HydrantEditor;

// import PropTypes from 'prop-types';
// HydrantEditor.defaultProps = {
// 	data: { },
// };
//
// HydrantEditor.propTypes = {
// 	data: PropTypes.object,
// 	history: PropTypes.object.isRequired,
// };
