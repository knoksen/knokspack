// Thin wrapper around the plugin's WordPress REST API.
// `window.knokspackData` is printed by PHP (includes/class-knokspack-admin.php).

// The global type lives in types/analytics.d.ts.
export type KnokspackData = Window['knokspackData'];

export function wpData(): KnokspackData | undefined {
    return typeof window !== 'undefined' ? window.knokspackData : undefined;
}

export async function apiFetch<T>(path: string, body?: unknown): Promise<T> {
    const data = wpData();
    if (!data) throw new Error('Knokspack must be opened from the WordPress admin.');
    const res = await fetch(data.restUrl + path, {
        method: body === undefined ? 'GET' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': data.nonce },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    let json: unknown = null;
    try { json = await res.json(); } catch { /* non-JSON error page */ }
    if (!res.ok) {
        const message = (json as { message?: string } | null)?.message;
        throw new Error(message || `Request failed (${res.status})`);
    }
    return json as T;
}
