function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const getCustomDeviceId = ({ deviceInfo }) => {
	if (!deviceInfo) return undefined;
	const { uniqueId, manufacturer, model, deviceId } = deviceInfo;
	return `${uniqueId}_${manufacturer}_${model}_${deviceId}_`;
};
export { getCustomDeviceId, sleep };
