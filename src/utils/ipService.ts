// IP Resolution and Client Signature Service

let cachedIp: string | null = null;
let isFetching = false;

const IP_STORAGE_KEY = 'mmw_client_ip_v1';

/**
 * Resolves the client's public IP address asynchronously.
 * Uses reliable public IP lookup APIs with caching and fallback.
 */
export async function getClientIp(): Promise<string> {
  if (cachedIp) return cachedIp;

  const stored = typeof window !== 'undefined' ? localStorage.getItem(IP_STORAGE_KEY) : null;
  if (stored) {
    cachedIp = stored;
  }

  if (isFetching && cachedIp) {
    return cachedIp;
  }

  isFetching = true;

  try {
    // Try ipify first (fast and standard)
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        cachedIp = data.ip;
        localStorage.setItem(IP_STORAGE_KEY, data.ip);
        isFetching = false;
        return data.ip;
      }
    }
  } catch {
    // Try secondary endpoint
    try {
      const res2 = await fetch('https://api64.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000)
      });
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2?.ip) {
          cachedIp = data2.ip;
          localStorage.setItem(IP_STORAGE_KEY, data2.ip);
          isFetching = false;
          return data2.ip;
        }
      }
    } catch {
      // Fallback
    }
  }

  isFetching = false;
  
  if (cachedIp) return cachedIp;
  
  // Local network / sandbox fallback signature
  const fallbackIp = '127.0.0.1 (Local Gateway)';
  return fallbackIp;
}

/**
 * Returns cached IP synchronously if available, otherwise returns standard fallback.
 */
export function getCachedIpSync(): string {
  if (cachedIp) return cachedIp;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(IP_STORAGE_KEY);
    if (stored) {
      cachedIp = stored;
      return stored;
    }
  }
  // Trigger background fetch for future requests
  getClientIp();
  return '127.0.0.1 (Resolving...)';
}

// Pre-warm the IP cache immediately on import
if (typeof window !== 'undefined') {
  getClientIp().catch(() => {});
}
