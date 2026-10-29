import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import { request } from 'node:http';

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Only disposable CI is supported');
assert.equal(process.env.KNOKSPACK_INTEGRATION_TEST, '1', 'CI fixture must be explicitly enabled');
const routes = new Set([
    '/', '/wp-login.php', '/wp-admin/admin-ajax.php', '/wp-admin/admin.php?page=knokspack',
    '/index.php?rest_route=/knokspack/v1/overview', '/index.php?rest_route=/knokspack/v1/ai/status',
]);
const server = createServer({
    key: readFileSync(process.env.TEST_TLS_KEY),
    cert: readFileSync(process.env.TEST_TLS_CERT),
}, (incoming, outgoing) => {
    if (!routes.has(incoming.url)) {
        outgoing.writeHead(404).end('Unknown fixture route');
        return;
    }
    const upstream = request({
        hostname: '127.0.0.1', port: 8091, method: incoming.method, path: incoming.url,
        headers: { ...incoming.headers, host: '127.0.0.1:8092', 'x-forwarded-proto': 'https' },
    }, (response) => {
        outgoing.writeHead(response.statusCode, response.headers);
        response.pipe(outgoing);
    });
    upstream.on('error', () => outgoing.writeHead(502).end('Fixture backend unavailable'));
    incoming.pipe(upstream);
});
server.listen(8092, '127.0.0.1');
