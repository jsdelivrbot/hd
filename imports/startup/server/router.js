import { Picker } from 'meteor/meteorhacks:picker';
// import bodyParser from 'body-parser';

// Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

Picker.route('/inmsg.aspx/:_id', (params, req, res, next) => {
	console.log('params');
	console.log(params);
	res.end('response');
});
