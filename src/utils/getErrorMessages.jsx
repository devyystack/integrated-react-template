/** @format */
import { setLackResource } from '../redux/slice/GameSlicer';
export default function getErrorMessages(
	error,
	dispatch,
	setErrorMessage,
	toggleModal
) {
	try {
		console.error(error);
		const message = JSON.parse(error?.message);
		if (message?.error?.details[0]?.message?.includes('transaction net'))
			dispatch(setLackResource('NET'));
		else if (message?.error?.details[0]?.message?.includes('billed CPU'))
			dispatch(setLackResource('CPU'));
		else {
			dispatch(
				setErrorMessage(
					message?.error?.details[0]?.message || error?.message || error
				)
			);
			dispatch(toggleModal(true));
		}
	} catch (e) {
		if (error?.message?.includes('of undefined'))
			dispatch(
				setErrorMessage('Try again later')
			);
		else if (error?.message?.includes('to fetch'))
			dispatch(setErrorMessage('Try again later'));
		else if (error?.message?.includes('Aborted due'))
			dispatch(
				setErrorMessage("You cannot wear more than 8 tools!")
			);
		else dispatch(setErrorMessage(error?.message || error));
		dispatch(toggleModal(true));
	}
}
