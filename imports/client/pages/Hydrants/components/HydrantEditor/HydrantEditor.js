
import React from 'react';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Flex, Box } from 'reflexbox';
import { Bert } from 'meteor/themeteorchef:bert';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
	compose,
	withStateHandlers,
	lifecycle,
} from 'recompose';
import _ from 'lodash';

import validate from '../../../../Utils/validate';

class CustomDateInput extends React.Component {
	render() {
		const p = this.props;
		return (
			<Button style={{ width: '120px' }} bsStyle="success" onClick={p.onClick}>
				{p.value || <span>&nbsp;</span>}
			</Button>
		);
	}
}

class HydrantEditor extends React.Component {
	constructor(props) {
		super(props);
		const { data } = this.props;
		const p = this.props;
		this.state = {
			status: data.status || 0,
			companyId: data.companyId || p.company._id,
			lastComm: data.lastComm ? moment(data.lastComm) : undefined,
			disableDate: data.disableDate ? moment(data.disableDate) : undefined,
			batchDate: data.batchDate ? moment(data.batchDate) : undefined,
		};
	}

	componentDidMount() {
		const component = this;
		validate(this.form, {
			rules: {
				sim: { required: true, maxlength: 24 },
				lat: { number: true, minlength: 9, maxlength: 9 },
				lon: { number: true, minlength: 9, maxlength: 9 },
				bodyBarcode: { required: true, maxlength: 25 },
				disableText: { maxlength: 250 },
				address: { maxlength: 50 },
				description: { maxlength: 50 },
				history: { maxlength: 50 },
				comments: { maxlength: 50 },
			},
			messages: {
				lat: { number: 'הפורמט: 12.123456', maxlength: 'הפורמט: 12.123456', minlength: 'הפורמט: 12.123456' },
				lon: { number: 'הפורמט: 12.123456', maxlength: 'הפורמט: 12.123456', minlength: 'הפורמט: 12.123456' },
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
			status: this.state.status,
			disableDate: this.state.disableDate ? this.state.disableDate.toISOString() : '',
			disableText: this.disableText.value,
			lastComm: this.state.lastComm ? this.state.lastComm.toISOString() : '',
			address: this.address.value,
			description: this.description.value,
			enabled: this.enabled.checked,
			bodyBarcode: this.bodyBarcode.value,
			batchDate: this.state.batchDate ? this.state.batchDate.toISOString() : '',
			history: this.history.value,
			comments: this.comments.value,
			companyId: this.state.companyId,
		};

		if (existingHydrant) data._id = existingHydrant;

		Meteor.call(methodToCall, data, (error, hydrantId) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				const confirmation = existingHydrant ? '&emsp; התעדכן הידרנט! ' : '&emsp; נוסף הידרנט! ';
				Bert.alert(confirmation, 'success', 'growl-top-left');
				if (this.state.companyId === this.props.company._id) history.push(`/hydrants/${hydrantId}`);
				else history.push('/hydrants');
			}
		});
	}

	render() {
		const { data } = this.props;
		const p = this.props;
		return (
			<Flex align="center">
				<Box w={1 / 5}>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						<FormGroup>
							<ControlLabel>מספר חברה</ControlLabel>
							<span>
								<select value={this.state.companyId} onChange={e => this.setState({ companyId: e.target.value })}>
									{p.cData.map(el => (<option key={el._id} value={el._id}>{el.name}</option>))}
								</select>
							</span>
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
								placeholder="12.123456"
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
								placeholder="12.123456"
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>סטטוס</ControlLabel>
							<span>
								<select value={this.state.status} onChange={e => this.setState({ status: e.target.value })}>
									{_.map(p.types.status,
										(statusName, n) => (<option key={n} value={n}>{statusName}</option>))}
								</select>
							</span>
						</FormGroup>
						<FormGroup>
							<ControlLabel>תקשורת אחרונה</ControlLabel>
							<DatePicker
								customInput={<CustomDateInput />}
								selected={this.state.lastComm}
								onChange={date => this.setState({ lastComm: date })}
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>תאריך ההשבתה</ControlLabel>
							<DatePicker
								customInput={<CustomDateInput />}
								selected={this.state.disableDate}
								onChange={date => this.setState({ disableDate: date })}
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
							<DatePicker
								customInput={<CustomDateInput />}
								selected={this.state.batchDate}
								onChange={date => this.setState({ batchDate: date })}
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
						<Button type="submit" bsStyle="danger">
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

export default compose(
	withStateHandlers(
		() => ({
			cData: [],
			loading: false,
		}), {
			setCData: () => cData => ({ cData: _.clone(cData) }),
			setLoading: () => loading => ({ loading }),
		}
	),
	lifecycle({
		async componentDidMount() {
			const p = this.props;
			p.setLoading(true);
			p.setCData(await Meteor.callPromise('companies.get.all'));
			p.setLoading(false);
		},
	}),
)(HydrantEditor);

