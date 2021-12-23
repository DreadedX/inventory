export type LoadingStatus = {
	fetch: boolean
	save: boolean
	delete: boolean
	options: boolean
	print: boolean
}

export const LoadingStatus = {
	defaultValue: (): LoadingStatus => {
		return {
			fetch: true,
			save: false,
			delete: false,
			options: true,
			print: false
		}
	}
}
