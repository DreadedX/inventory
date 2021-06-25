interface ApiPart {
	id: string
	name: string
	description: string
	footprint: string
	quantity: number
	storage?: ApiStorage
}

type Type = "part" | "storage";

// @todo We need to split this into multiple types depending on the reqeuest
interface ApiStorage {
	id: string
	name: string
	parts?: ApiPart[]
	partCount?: number
}

interface ApiResponse<T> {
	data?: T
	message?: string
	error?: string
}
