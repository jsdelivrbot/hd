
import React from 'react';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Flex, Box } from 'reflexbox';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../../Utils/validate';

class CompanyEditor extends React.Component {
	componentDidMount() {
		const component = this;
		validate(this.form, {
			rules: {
				name: { required: true, maxlength: 50 },
				address: { required: true, maxlength: 50 },
				contactPerson: { required: true, maxlength: 50 },
			},
			messages: {
				name: { required: 'נא לציין שם החברה', maxlength: 'אורך מקסימלי 50' },
				address: { required: 'נא לציין כתובת', maxlength: 'אורך מקסימלי 50' },
				contactPerson: { required: 'נא לציין שם איש קשר', maxlength: 'אורך מקסימלי 50' },
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	handleSubmit() {
		const { history } = this.props;
		const existingCompany = this.props.data && this.props.data._id;
		const methodToCall = existingCompany ? 'companies.update' : 'companies.insert';
		const data = {
			name: this.name.value,
			address: this.address.value,
			contactPerson: this.contactPerson.value,
		};

		if (existingCompany) data._id = existingCompany;
		Meteor.call(methodToCall, data, (error, _id) => {
			if (error) {
				Bert.alert(error.reason, 'danger');
			} else {
				const confirmation = existingCompany ? '&emsp; החברה התעדכנה! ' : '&emsp; נוספה חברה! ';
				this.form.reset();
				Bert.alert(confirmation, 'success', 'growl-top-left');
				history.push(`/companies/${_id}`);
			}
		});
	}

	render() {
		const { data } = this.props;
		return (
			<Flex align="center">
				<Box w={1 / 5}>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						<FormGroup className="has-warning">
							<ControlLabel>שם החברה</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="name"
								ref={name => (this.name = name)}
								defaultValue={data && data.name}
								placeholder="חובה"
							/>
						</FormGroup>
						<FormGroup className="has-warning">
							<ControlLabel>כתובת</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="address"
								ref={address => (this.address = address)}
								defaultValue={data && data.address}
								placeholder="חובה"
							/>
						</FormGroup>
						<FormGroup className="has-warning">
							<ControlLabel>שם איש קשר</ControlLabel>
							<input
								type="text"
								className="form-control"
								name="contactPerson"
								ref={contactPerson => (this.contactPerson = contactPerson)}
								defaultValue={data && data.contactPerson}
								placeholder="חובה"
							/>
						</FormGroup>
						<Button type="submit" bsStyle="success">
							{data && data._id ? 'לשמור שינויים' : 'להוסיף חברה'}
						</Button>
					</form>
				</Box>
				<Box w={2 / 5} />
				<Box w={2 / 5} />
			</Flex>
		);
	}
}

export default CompanyEditor;
