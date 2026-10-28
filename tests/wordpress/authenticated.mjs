import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:8091';
assert.equal(process.env.KNOKSPACK_INTEGRATION_TEST, '1', 'CI fixture must be explicitly enabled');
assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Only disposable CI is supported');

class Session {
    cookies = new Map();

    async request(path, { form, nonce } = {}) {
        const headers = { Cookie: [...this.cookies].map(([key, value]) => `${key}=${value}`).join('; ') };
        if (nonce !== undefined) headers['X-WP-Nonce'] = nonce;
        if (form !== undefined) headers.Origin = origin;
        const response = await fetch(origin + path, {
            method: form === undefined ? 'GET' : 'POST',
            body: form === undefined ? undefined : new URLSearchParams(form),
            headers,
            redirect: 'manual',
        });
        for (const cookie of response.headers.getSetCookie()) {
            const pair = cookie.split(';', 1)[0];
            const split = pair.indexOf('=');
            this.cookies.set(pair.slice(0, split), pair.slice(split + 1));
        }
        return response;
    }

    async ajax(action, data = {}) {
        return this.request('/wp-admin/admin-ajax.php', { form: { action, ...data } });
    }

    async login(user, password) {
        assert.equal(typeof password, 'string', 'Fixture password is required');
        await this.request('/wp-login.php');
        const response = await this.request('/wp-login.php', {
            form: { log: user, pwd: password, testcookie: '1', redirect_to: origin + '/wp-admin/' },
        });
        assert.equal(response.status, 302, 'WordPress login must redirect after setting cookies');
        return this.identity();
    }

    async identity() {
        const response = await this.ajax('knokspack_integration_session');
        const result = await response.json();
        assert.equal(result.success, true, 'Fixture must recognize a real authenticated session');
        assert.ok(result.data.user_id > 0, 'WordPress user must be authenticated');
        return result.data;
    }

    async overview(nonce) {
        return this.request('/index.php?rest_route=/knokspack/v1/overview', { nonce });
    }
}

const guest = new Session();
assert.equal((await guest.ajax('knokspack_integration_session')).status, 400, 'Guest cannot obtain authenticated fixture nonces');

const admin = new Session();
const administrator = await admin.login('integration_admin', process.env.TEST_ADMIN_PASSWORD);
assert.equal((await admin.overview(administrator.rest)).status, 200, 'Admin cookie plus nonce authorizes REST');
assert.equal((await admin.overview()).status, 401, 'Admin cookie alone does not authorize REST');
assert.equal((await admin.overview('invalid-fixture-nonce')).status, 403, 'Invalid REST nonce is rejected');
// A nonce from the live admin screen must work, not only the test fixture.
const adminPage = await (await admin.request('/wp-admin/admin.php?page=knokspack')).text();
const localized = adminPage.match(/var knokspackData = (\{[^;]+\});/);
assert.ok(localized, 'Packaged admin page must expose its normal REST bootstrap');
const bootstrap = JSON.parse(localized[1]);
assert.equal((await admin.overview(bootstrap.nonce)).status, 200, 'Real admin-page nonce authorizes REST');
assert.equal(Object.hasOwn(bootstrap, 'api_key'), false, 'Admin bootstrap must not expose an API key');

const subscriber = new Session();
const reader = await subscriber.login('integration_subscriber', process.env.TEST_SUBSCRIBER_PASSWORD);
assert.equal((await subscriber.overview(reader.rest)).status, 403, 'Subscriber cookie and valid nonce cannot elevate privileges');

const editor = new Session();
const writer = await editor.login('integration_editor', process.env.TEST_EDITOR_PASSWORD);
assert.equal((await editor.overview(writer.rest)).status, 403, 'Editor cannot read administrative overview');
const aiStatus = await editor.request('/index.php?rest_route=/knokspack/v1/ai/status', { nonce: writer.rest });
assert.equal(aiStatus.status, 200, 'Editor can read authorized AI readiness');
assert.equal((await aiStatus.json()).configured, false, 'No provider credential is configured or used');

for (const action of ['knokspack_create_backup', 'knokspack_delete_backup', 'knokspack_restore_backup']) {
    const rejected = await admin.ajax(action, { _ajax_nonce: 'invalid-fixture-nonce', type: 'database', backup_id: '1' });
    assert.equal(rejected.status, 403, 'Invalid nonce must reject privileged backup operation');
    const denied = await subscriber.ajax(action, { _ajax_nonce: reader.backup, type: 'database', backup_id: '1' });
    assert.equal((await denied.json()).success, false, 'Subscriber with valid nonce must still fail capability check');
}
const unchanged = await admin.identity();
assert.deepEqual(unchanged.backup_ids, administrator.backup_ids, 'Rejected backup requests must preserve records');
assert.equal(unchanged.marker, 'synthetic-only', 'Rejected requests must preserve fixture data');

const restored = await admin.ajax('knokspack_restore_backup', { _ajax_nonce: administrator.backup, backup_id: '1' });
const restoreResult = await restored.json();
assert.equal(restoreResult.success, false, 'Even an authorized administrator cannot execute disabled restore');
assert.match(restoreResult.data, /Restore is temporarily disabled/);
assert.deepEqual((await admin.identity()).backup_ids, administrator.backup_ids, 'Disabled restore cannot alter backup records');

const created = await (await admin.ajax('knokspack_create_backup', { _ajax_nonce: administrator.backup, type: 'database' })).json();
assert.equal(created.success, true, 'Authorized admin can create fixture database archive');
assert.ok(Number.isInteger(created.data), 'Creation returns a database identity');
const deleted = await (await admin.ajax('knokspack_delete_backup', { _ajax_nonce: administrator.backup, backup_id: String(created.data) })).json();
assert.equal(deleted.success, true, 'Authorized admin can delete only the newly created fixture archive');
assert.deepEqual((await admin.identity()).backup_ids, administrator.backup_ids, 'Create/delete leaves prior backup records intact');

const statsDenied = await (await subscriber.ajax('knokspack_get_stats', { _ajax_nonce: reader.stats })).json();
assert.equal(statsDenied.success, false, 'Subscriber cannot read admin analytics');
assert.equal((await (await admin.ajax('knokspack_get_stats', { _ajax_nonce: administrator.stats })).json()).success, true, 'Administrator can read analytics');
const event = { _ajax_nonce: reader.stats, event_type: 'click', event_name: 'fixture_click' };
assert.equal((await subscriber.ajax('knokspack_track_event', event)).status, 403, 'Authenticated event still requires visitor consent');
assert.equal((await (await subscriber.ajax('knokspack_set_analytics_consent', { nonce: reader.consent, consent: 'granted' })).json()).success, true);
assert.equal((await (await subscriber.ajax('knokspack_track_event', event)).json()).success, true, 'Valid opt-in enables fixture event');
assert.equal((await (await subscriber.ajax('knokspack_set_analytics_consent', { nonce: reader.consent, consent: 'denied' })).json()).success, true);
assert.equal((await subscriber.ajax('knokspack_track_event', event)).status, 403, 'Withdrawal also stops authenticated events');
console.log('PASS: real login cookies, normal admin-page nonce, role boundaries, privileged AJAX, disabled restore and event-consent withdrawal');
