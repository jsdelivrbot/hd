
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
	withHandlers,
	compose,
	withStateHandlers,
	lifecycle,
	renderComponent,
	branch,
	shallowEqual,
} from 'recompose';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import _ from 'lodash';
import fp from 'lodash/fp';
import { Flex, Box } from 'reflexbox';
import { Button } from 'react-bootstrap';
import 'react-select/dist/react-select.css';

import '../../stylesheets/table.scss';
import './Css/Users.scss';

import Loading from '../../components/LayoutLoginAndNavigationAndGeneral/Loading/Loading';

import {
	getStore as getStoreUsersPage,
	setStore as setStoreUsersPage,
} from '../../Storage/Storage';

const getStore = keys => getStoreUsersPage('usersPage', keys);
const setStore = obj => setStoreUsersPage('usersPage', obj);

export default compose(
	withStateHandlers(
		() => ({
			cData: [],
			editRow: {},
			data: getStore('data') || [],
			initialized: false,
			loading: false,
		}), {
			assignEditRow: ({ editRow }) => obj => ({ editRow: _.assign({}, editRow, _.cloneDeep(obj)) }),
			setEditRow: () => editRow => ({ editRow: _.cloneDeep(editRow) }),
			setCData: () => cData => ({ cData: _.clone(cData) }),
			setData: () => data => setStore({ data: _.clone(data) }),
			setDataRow: ({ data }) => (row, nRow) => setStore({ data: _.clone(_.set(data, `[${nRow}]`, _.cloneDeep(row))) }),
			setLoading: () => loading => ({ loading }),
			setInitialized: () => initialized => ({ initialized }),
		}
	),
	lifecycle({
		async componentDidMount() {
			console.log('initializing');
			const p = this.props;
			if (!getStore()) {
				this.props.setLoading(true);
				p.setCData(await Meteor.callPromise('companies.get.all'));
				p.setData(_.map(await Meteor.callPromise('users.get.all'), (e, k) => _.assign(e, { nRow: k })));
				p.setLoading(false);
			}
			console.log('initialized');
			p.setInitialized(true);
		},
	}),
	withHandlers({
		onClickEdit: p => (row) => {
			p.setEditRow(row);
		},
		onClickCancel: p => () => {
			p.setEditRow({});
		},
		onClickSave: p => async (row) => {
			console.log('onClickSave');
			if (!_.isEqual(row, p.editRow)) {
				let { _id, companyId, role } = p.editRow;
				({ _id, companyId, role } = await Meteor.callPromise('user.update', { _id, companyId, role }));
				p.assignEditRow({ companyId, role });
				p.setDataRow(p.editRow, row.nRow);
			}
			p.setEditRow({});
		},
		onClickRole: p => (role) => {
			console.log('onClickRole');
			if (role !== p.editRow.role) p.assignEditRow({ role });
		},
	}),
	branch(p => !p.initialized, renderComponent(Loading)),
)(

	(p) => {
		console.log('rendering');
		console.log('data');
		console.log(p.data);
		console.log('p.cData');
		console.log(p.cData);

		const formatter = cell => (<span>{cell}</span>);
		const formatButton = (cell, row, ncol, nRow) => (
			<span>
				{nRow == p.editRow.nRow ?
					<div>
						<Flex>
							<Box w={1} ml={1} mr={1}>
								<Button
									bsStyle="primary" block
									onClick={() => p.onClickSave(row)}
								>
									שמור
								</Button>
							</Box>
							<Box w={1} ml={1} mr={1}>
								<Button
									bsStyle="primary" block
									onClick={p.onClickCancel}
								>
									בטל
								</Button>
							</Box>
						</Flex>
					</div>
					:
					<Button
						bsStyle="success" block
						onClick={() => p.editRow.nRow || p.onClickEdit(row)}
					>
						ערוך
					</Button>
				}
			</span>
		);
		const formatList = (cell, row, ncol, nRow) => (
			<span>
				{nRow == p.editRow.nRow ?
					<select value={p.editRow.companyId} onChange={e => p.assignEditRow({ companyId: e.target.value })}>
						{p.cData.map(el => (<option key={el._id} value={el._id}>{el.name}</option>))}
					</select>
					:
					_.find(p.cData, ['_id', cell]).name
				}
			</span>
		);
		const formatRole = role => (cell, row, ncol, nRow) => (
			<span>
				{nRow == p.editRow.nRow ?
					<Button
						bsStyle="primary" block
						className={(role == p.editRow.role) ? 'selected-cell' : 'not-selected-cell'}
						onClick={() => p.onClickRole(role)}
					>
						&nbsp;
					</Button>
					:
					<Button
						bsStyle="primary" block disabled
						className={(role == row.role) ? 'selected-cell' : 'not-selected-cell'}
					>
						&nbsp;
					</Button>
				}
			</span>
		);

		return (
			<div className="users">
				<Flex>
					<Box w={11 / 12}>
						<BootstrapTable
							keyField="_id"
							containerClass="table_container_class"
							tableContainerClass="table_class"
							data={p.data}
							remote
							height="600px"
						>
							<TableHeaderColumn dataField="name" dataFormat={formatter} width="165px" dataAlign="center" headerAlign="center">
								שם
							</TableHeaderColumn>
							<TableHeaderColumn dataField="email" dataFormat={formatter} width="165px" dataAlign="center" headerAlign="center">
								אימייל
							</TableHeaderColumn>
							<TableHeaderColumn dataField="companyId" dataFormat={formatList} width="165px" dataAlign="center" headerAlign="center">
								חברה
							</TableHeaderColumn>
							{_.map(p.types.roles, (role, n) => (
								<TableHeaderColumn key={n} dataField="role" dataFormat={formatRole(n)} width="85px" dataAlign="center" headerAlign="center">
									{role}
								</TableHeaderColumn>
							))}
							<TableHeaderColumn dataFormat={formatButton} dataAlign="center" headerAlign="center">
								<Button
									bsStyle="primary"
									block
									onClick={() => p.history.push(
										`${p.match.url}/new`
									)}
								>
									חדש
								</Button>
							</TableHeaderColumn>
						</BootstrapTable>
					</Box>
				</Flex>
			</div>
		);
	});







import React from 'react';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import AccountPageFooter from '../../../../components/LayoutLoginAndNavigationAndGeneral/MaybeNotNeeded/AccountPageFooter/AccountPageFooter';
import validate from '../../../../../modules/validate';

class Signup extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		const component = this;

		validate(component.form, {
			rules: {
				firstName: {
					required: true,
				},
				lastName: {
					required: true,
				},
				emailAddress: {
					required: true,
					email: true,
				},
			},
			messages: {
				firstName: {
					required: 'מה שמך?',
				},
				lastName: {
					required: 'מה שם משפחתך?',
				},
				emailAddress: {
					required: 'דרוש אימייל',
					email: 'האם כתובת האימייל נכונה?',
				},
			},
			submitHandler() {
				component.handleSubmit();
			},
		});
	}

	handleSubmit() {
		const { history } = this.props;

// Accounts.createUser({
// 	email: this.emailAddress.value,
// 	password: this.password.value,
// 	profile: {
// 		name: {
// 			first: this.firstName.value,
// 			last: this.lastName.value,
// 		},
// 	},
// }, (error) => {
// 	if (error) {
// 		Bert.alert(error.reason, 'danger');
// 	} else {
// 		Meteor.call('user.sendVerificationEmail');
// 		Bert.alert('&emsp;ברוך הבא!', 'success', 'growl-top-left');
// 		history.push('/');
// 	}
// });

	}

	render() {
		return (<div className="Signup">
			<Row>
				<Col xs={12} sm={6} md={5} lg={4}>
					<h4 className="page-header">פתח חשבון</h4>
					<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
						<Row>
							<Col xs={6}>
								<FormGroup>
									<ControlLabel>שם</ControlLabel>
									<input
										type="text"
										name="firstName"
										ref={firstName => (this.firstName = firstName)}
										className="form-control"
									/>
								</FormGroup>
							</Col>
							<Col xs={6}>
								<FormGroup>
									<ControlLabel>שם משפחה</ControlLabel>
									<input
										type="text"
										name="lastName"
										ref={lastName => (this.lastName = lastName)}
										className="form-control"
									/>
								</FormGroup>
							</Col>
						</Row>
						<FormGroup>
							<ControlLabel>אימייל</ControlLabel>
							<input
								type="email"
								name="emailAddress"
								ref={emailAddress => (this.emailAddress = emailAddress)}
								className="form-control"
							/>
						</FormGroup>
						<Button type="submit" bsStyle="success">הירשם</Button>
					</form>
				</Col>
			</Row>
		</div>);
	}
}

Signup.propTypes = {
	history: PropTypes.object.isRequired,
};

export default Signup;





// options={{
// 	onRowClick: p.select,
// }}
// select: ({ data, setData }) => (orow, ncol, nRow, a) => {
// 	console.log('select');
// 	if (!ncol) return;
// 	const row = Object.assign({}, data[nRow]);
// 	for (let i = 1; i <= 3; i += 1) if (i !== ncol - 1) row[`role${i}`] = false;
// 	row[`role${ncol - 1}`] = true;
// 	data[nRow] = row;
// 	setData(data.slice());
// },


// {/*<select>*/}
// 	{/*<option value="volvo">Volvo</option>*/}
// 	{/*<option value="saab">Saab</option>*/}
// 	{/*<option value="mercedes">Mercedes</option>*/}
// 	{/*<option value="audi">Audi</option>*/}
// {/*</select>*/}


// <FormGroup controlId="formControlsSelect">
// 	<FormControl componentClass="select" placeholder="select1">
// 		<option value="select1">select1</option>
// 		<option value="select2">select2</option>
// 		<option value="select3">select3</option>
// 	</FormControl>
// </FormGroup>
// <Select
//
// 	name="select"
// 	value={cell}
// 	options={p.cData}
// 	onChange={p.setSelectedCompanyId}
// />
