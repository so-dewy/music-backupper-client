export function fetchApi<T>(url: string, options: any): Promise<T> {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<T>
    });
}