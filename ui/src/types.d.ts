type Type = "part" | "storage";

interface ApiResponse<T> {
	data?: T
	message?: string
	error?: string
}
