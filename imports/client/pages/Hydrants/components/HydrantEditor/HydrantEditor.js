
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
import { removeLastSlash } from '../../../../Utils/Utils';


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
				lat: { number: true, maxlength: 9 },
				lon: { number: true, maxlength: 9 },
				bodyBarcode: { required: true, maxlength: 25 },
				disableText: { maxlength: 250 },
				address: { maxlength: 50 },
				description: { maxlength: 50 },
				history: { maxlength: 50 },
				comments: { maxlength: 50 },
			},
			messages: {
				lat: { number: 'הפורמט: 12.123456', maxlength: 'הפורמט: 12.123456' },
				lon: { number: 'הפורמט: 12.123456', maxlength: 'הפורמט: 12.123456' },
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
			status: this.state.status,
			enabled: this.enabled.checked,
			companyId: this.state.companyId,
		};
		data.lat = _.get(this, 'lat.value');
		data.lon = _.get(this, 'lon.value');
		data.disableText = _.get(this, 'disableText.value');
		data.address = _.get(this, 'address.value');
		data.description = _.get(this, 'description.value');
		data.bodyBarcode = _.get(this, 'bodyBarcode.value');
		data.history = _.get(this, 'history.value');
		data.comments = _.get(this, 'comments.value');
		data.batchDate = (d => (d ? d.toDate() : null))(this.state.batchDate);
		data.lastComm = (d => (d ? d.toDate() : null))(this.state.lastComm);
		data.disableDate = (d => (d ? d.toDate() : null))(this.state.disableDate);
		
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
					<form style={{ marginBottom: 50 }} ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
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
								isClearable
								placeholderText="בחר"
								customInput={<CustomDateInput />}
								selected={this.state.lastComm}
								onChange={date => this.setState({ lastComm: date })}
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>תאריך ההשבתה</ControlLabel>
							<DatePicker
								isClearable
								placeholderText="בחר"
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
						<div>
							<input
								type="checkbox"
								className="form-control"
								name="enabled"
								ref={enabled => (this.enabled = enabled)}
								defaultChecked={(data && data.enabled) ? 'checked' : ''}
							/>
						</div>
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
								isClearable
								placeholderText="בחר"
								customInput={<CustomDateInput />}
								selected={this.state.batchDate}
								onChange={date => this.setState({ batchDate: date })}
							/>
						</FormGroup>
						<FormGroup className="has-warning">
							<ControlLabel>ברקוד</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="bodyBarcode"
								ref={bodyBarcode => (this.bodyBarcode = bodyBarcode)}
								defaultValue={data && data.bodyBarcode}
								placeholder="חובה"
							/>
						</FormGroup>
						<Flex>
							<Box w={1} ml={1}>
								<Button type="submit" bsStyle="danger">
									{data && data._id ? 'לשמור שינויים' : 'להוסיף הידרנט'}
								</Button>
							</Box>
							<Box w={1} mr={3}>
								<Button
									bsStyle="primary" block
									onClick={() => p.history.push(removeLastSlash(p.match.url))}
								>
									ביטול
								</Button>
							</Box>
						</Flex>
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

