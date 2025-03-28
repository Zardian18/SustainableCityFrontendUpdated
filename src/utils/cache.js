const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
	try {
		const cached = localStorage.getItem(key);
		if (!cached) return null;

		const { timestamp, data } = JSON.parse(cached);
		if (Date.now() - timestamp < CACHE_EXPIRATION) {
			return data;
		}
		// Clear expired cache
		localStorage.removeItem(key);
		return null;
	} catch (e) {
		console.error("Cache parse error:", e);
		return null;
	}
};

export const setCachedData = (key, data) => {
	try {
		const cacheEntry = {
			timestamp: Date.now(),
			data: data,
		};
		localStorage.setItem(key, JSON.stringify(cacheEntry));
	} catch (e) {
		console.error("Cache set error:", e);
	}
};
