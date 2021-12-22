export type LoadingStatus = {
	fetch: boolean
	save: boolean
	delete: boolean
	options: boolean
}

export const LoadingStatus = {
	defaultValue: (): LoadingStatus => {
		return {
			fetch: false,
			save: false,
			delete: false,
			options: false
		}
	}
}
