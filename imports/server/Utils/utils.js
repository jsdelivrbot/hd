function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const getCustomDeviceId = ({ deviceInfo }) => {
	if (!deviceInfo) return undefined;
	const { uniqueId, manufacturer, model, deviceId } = deviceInfo;
	return `${uniqueId}_${manufacturer}_${model}_${deviceId}_`;
};

function isNumeric(x) {
	return ((typeof x === 'number' || typeof x === 'string') && !isNaN(Number(x)) && x !== '');
}

export { isNumeric, getCustomDeviceId, sleep };
