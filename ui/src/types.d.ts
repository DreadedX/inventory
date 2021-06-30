interface ApiPart {
	id: string
	name: string
	description: string
	footprint: string
	quantity: number
	storageID?: string
	storage?: ApiStorage
	links?: ApiLink[]
}

type Type = "part" | "storage";

interface ApiStorage {
	id: string
	name: string
	parts?: ApiPart[]
	partCount?: number
}

interface ApiLink {
	id: number
	url: string
	partID: string
}

interface ApiResponse<T> {
	data?: T
	message?: string
	error?: string
}
