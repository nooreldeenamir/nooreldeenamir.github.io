// A deliberately small transport example, not the generated Frankfurter SDK.
export async function loadRate(base, quote, {
  fetcher = fetch,
  api = 'https://api.frankfurter.dev/v2/',
  signal = AbortSignal.timeout(5000),
} = {}) {
  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote)) {
    throw new TypeError('Use three uppercase currency letters');
  }
  const response = await fetcher(new URL(`rate/${base}/${quote}`, api), { signal });
  if (!response.ok) throw new Error(`Rate request failed: HTTP ${response.status}`);
  const data = await response.json();
  if (!data || data.base !== base || data.quote !== quote ||
      !Number.isFinite(data.rate) || data.rate <= 0) {
    throw new TypeError('Unexpected rate response');
  }
  return { base: data.base, quote: data.quote, rate: data.rate };
}
