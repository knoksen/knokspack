/* global document, fetch, URLSearchParams, window */
/* eslint-disable jest/require-hook -- This file is a WordPress browser script, not a Jest test. */
(() => {
    const controls = document.querySelector('.knokspack-analytics-preferences');
    const settings = window.knokspackAnalyticsConsent;

    if (!controls || !settings) {
        return;
    }

    const status = controls.querySelector('[data-knokspack-consent-status]');
    controls.querySelectorAll('[data-knokspack-consent]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            const body = new URLSearchParams({
                action: 'knokspack_set_analytics_consent',
                nonce: settings.nonce,
                consent: button.dataset.knokspackConsent,
            });

            try {
                const response = await fetch(settings.ajaxUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    body,
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.data || 'Could not save analytics preference.');
                }
                status.textContent = result.data.consent === 'granted'
                    ? 'Preference saved. Optional analytics will be collected on your next page request.'
                    : 'Preference saved. No further analytics will be collected.';
            } catch (error) {
                status.textContent = error instanceof Error ? error.message : 'Could not save analytics preference.';
            } finally {
                button.disabled = false;
            }
        });
    });
})();
