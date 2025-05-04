const API_URL = process.env.REACT_APP_API_URL || '';

if (!API_URL) {
  throw new Error('REACT_APP_API_URL environment variable is not set.');
}

const BASE_URL = API_URL.replace('/api', '');

export { API_URL, BASE_URL };