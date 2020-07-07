

/**
 * Simplify environment variable reading by creating a single, short function to read environment variables
 * 
 * @param key 
 * @param fallback 
 */
export function env(key: string, fallback?: any) {
	console.log(key, process.env[key], fallback);
	return process.env[key] ?? fallback;
}