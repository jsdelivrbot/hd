import { createContainer } from 'meteor/react-meteor-data';

const meteorData = propsFn => Component => createContainer(propsFn, Component);

export { meteorData };
