/** Explicit public entrypoints. Do not trust arbitrary X-Forwarded-Host values. */
const publicOrigins = new Set(['https://12wr79ei80535.vicp.fun']);
export function allowedOrigin(req: Request): boolean {
    const origin = req.headers.get('origin');
    return !origin || origin === new URL(req.url).origin || publicOrigins.has(origin);
}
export function secureSession(req: Request): boolean {
    return new URL(req.url).protocol === 'https:' || publicOrigins.has(req.headers.get('origin') || '');
}
