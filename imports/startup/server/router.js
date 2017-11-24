import { Picker } from 'meteor/meteorhacks:picker';

Picker.route('/input', (params, req, res, next) => {
	console.log('params.query');
	console.log(params.query);



	res.end('response');
});
