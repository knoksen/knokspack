(() => {
    const controls = document.querySelector('.knokspack-analytics-preferences');
    const settings = window.knokspackAnalyticsConsent;

    if (!controls || !settings) {
        return;
    }

    const status = controls.querySelector('[data-knokspack-consent-status]');
    if (status === null) return;
    const buttons = controls.querySelectorAll('[data-knokspack-consent]');
    buttons.forEach((button) => {
        button.addEventListener('click', async () => {
            buttons.forEach((control) => { control.disabled = true; });
            const body = new window.URLSearchParams({
                action: 'knokspack_set_analytics_consent',
                nonce: settings.nonce,
                consent: button.dataset.knokspackConsent,
            });

            try {
                const response = await window.fetch(settings.ajaxUrl, {
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
                buttons.forEach((control) => { control.disabled = false; });
            }
        });
    });
})();
