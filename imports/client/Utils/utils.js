
import _ from 'lodash';

const difProps = ({ prevProps, nextProps }) => (
	_.reduce(nextProps, (result, value, key) => {
		if (value !== prevProps[key]) result[key] = true;
		return result;
	}, {}));

const removeLastSlash = (s) => {
	const l = s.length;
	return s.slice(0, (s[l - 1] == '/') ? l - 1 : l);
};

export { removeLastSlash, difProps };

// import { createContainer } from 'meteor/react-meteor-data';

// const meteorData = propsFn => Component => createContainer(propsFn, Component);

// Compare props and return modified next props
