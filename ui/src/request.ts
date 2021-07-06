export async function request<T>(url: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
	return fetch(url, config)
	.then(response => {
		if (response.status < 200 || response.status >= 500) {
			throw new Error(response.statusText);
		}
		return response.json();
	})
	.then(data => data as ApiResponse<T>)
	.then(data => {
		if (data.error) {
			throw new Error(data.error);
		}
		return data;
	})
}

export async function requestStatus(url: string, config: RequestInit = {}): Promise<Number> {
	return fetch(url, config)
	.then(response => {
		if (response.status < 200 || response.status >= 500) {
			throw new Error(response.statusText);
		}
		return response.status;
	})
}

