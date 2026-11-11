import { loadRate } from './rates.mjs';
const requests = [];
const fetcher = async (url, options) => {
  requests.push({ path: url.pathname, hasSignal: options.signal instanceof AbortSignal });
  return new Response(JSON.stringify({ base: 'EUR', quote: 'USD', rate: 1.25 }));
};
console.log(await loadRate('EUR', 'USD', { fetcher }));
console.log(requests);
console.log('Synthetic fixture: no network call or current exchange-rate claim.');
